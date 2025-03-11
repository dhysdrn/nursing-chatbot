import express from "express";
import cors from "cors";
import { translate } from "./nlpTranslator.js";
import { scrapeData } from "./scraper.js";
import { utterances } from "./db/nlpUtterances.js";

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

let nursingDataCache = null;
let lastTopic = null;

const refreshNursingData = async () => {
  const scrapedData = await scrapeData();
  if (scrapedData && scrapedData.nursingData) {
    nursingDataCache = scrapedData.nursingData;
    console.log("✅ Nursing data cache refreshed");
  } else {
    console.error("❌ Failed to refresh nursing data cache");
  }
};

refreshNursingData();

const summarizeContent = (question, intent, content) => {
  if (!content || typeof content !== "string") {
    return "Sorry, I couldn’t find specific details for that question.";
  }

  const lowerQuestion = question.toLowerCase();
  const lines = content.split("\n").filter((line) => line.trim());

  if (intent === "agent.degrees") {
    const degreeHeadings = [
      "Nursing - Associate Degree",
      "Nursing - Bachelor Degree",
      "Nursing - Transfer Degree",
    ];
    let combinedContent = "";
    degreeHeadings.forEach((heading) => {
      if (nursingDataCache[heading]) {
        combinedContent += `\n${heading}:\n${nursingDataCache[heading]}\n`;
      }
    });
    return (
      combinedContent.trim() || "Sorry, I couldn’t find detailed degree info."
    );
  }

  if (
    lowerQuestion.includes("what") ||
    lowerQuestion.includes("about") ||
    lowerQuestion.includes("tell me") ||
    lowerQuestion === "admissions" ||
    lowerQuestion === "degrees"
  ) {
    return lines.slice(0, 7).join("\n") || content;
  } else if (
    lowerQuestion.includes("how") &&
    (lowerQuestion.includes("apply") || lowerQuestion.includes("get in"))
  ) {
    return "To apply, visit the Green River College website for the application process and requirements. You can also attend an Application Workshop—check the Events Page for dates!";
  } else if (lowerQuestion.includes("where")) {
    if (lastTopic === "events") {
      return "Find event details on the Events Page of the Green River College website!";
    } else if (lastTopic === "admissions") {
      return "Check the Green River College website for admissions info or email nursing@greenriver.edu.";
    }
    return "Visit the Green River College website for more details.";
  } else if (lowerQuestion.includes("more")) {
    return content;
  }
  return lines.join("\n") || content;
};

app.post("/ask", async (req, res) => {
  const userQuestion = req.body.question || "";
  console.log(`Processing question: "${userQuestion}"`);

  let response = await translate(userQuestion);
  let answer = "";

  if (response && nursingDataCache) {
    const { intent, content } = response;
    lastTopic = intent.split("agent.")[1];
    answer = summarizeContent(userQuestion, intent, content);
  } else if (nursingDataCache) {
    const lowerQuestion = userQuestion.toLowerCase();
    const keywords = lowerQuestion.split(" ").filter((word) => word.length > 2);
    let relevantContent = "";

    if (
      lowerQuestion.includes("more") &&
      lastTopic &&
      utterances[lastTopic] &&
      (utterances[lastTopic].response ||
        nursingDataCache[utterances[lastTopic].heading])
    ) {
      relevantContent =
        utterances[lastTopic].response ||
        nursingDataCache[utterances[lastTopic].heading];
    } else {
      for (const [key, value] of Object.entries(utterances)) {
        if (value.phrases.includes(lowerQuestion)) {
          relevantContent = value.response || nursingDataCache[value.heading];
          lastTopic = key;
          break;
        }
      }
      if (!relevantContent) {
        for (const [heading, content] of Object.entries(nursingDataCache)) {
          const lowerHeading = heading.toLowerCase();
          const lowerContent = content.toLowerCase();
          if (
            keywords.some(
              (keyword) =>
                lowerHeading.includes(keyword) || lowerContent.includes(keyword)
            )
          ) {
            relevantContent = content;
            lastTopic =
              Object.keys(utterances).find(
                (k) => utterances[k].heading === heading
              ) || heading;
            break;
          }
        }
      }
    }

    answer = relevantContent
      ? summarizeContent(userQuestion, null, relevantContent.trim())
      : "Hmm, I couldn’t find that. Try asking about programs, admissions, degrees, or events!";
  } else {
    answer = "Sorry, I couldn’t load the data. Please try again!";
  }

  console.log(`Response: "${answer.slice(0, 100)}..."`);
  res.json({ response: answer });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
