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

  // Specific intent handling
  if (intent === "agent.admissions") {
    const admissionKeywords = [
      "apply",
      "admission",
      "requirements",
      "eligibility",
    ];
    const relevantLines = lines.filter((line) =>
      admissionKeywords.some((keyword) => line.toLowerCase().includes(keyword))
    );
    return relevantLines.length > 0
      ? relevantLines.join("\n")
      : lines.slice(0, 7).join("\n") || content;
  } else if (
    intent === "agent.degrees" ||
    intent === "agent.associate_degree" ||
    intent === "agent.bachelors" ||
    intent === "agent.bsn_program"
  ) {
    const degreeKeywords = [
      "degree",
      "associate",
      "bachelor",
      "bsn",
      "program",
    ];
    const relevantLines = lines.filter((line) =>
      degreeKeywords.some((keyword) => line.toLowerCase().includes(keyword))
    );
    return relevantLines.length > 0
      ? relevantLines.join("\n")
      : lines.slice(0, 7).join("\n") || content;
  } else if (intent === "agent.events") {
    const eventKeywords = [
      "event",
      "open house",
      "workshop",
      "date",
      "schedule",
    ];
    const relevantLines = lines.filter((line) =>
      eventKeywords.some((keyword) => line.toLowerCase().includes(keyword))
    );
    return relevantLines.length > 0
      ? relevantLines.join("\n")
      : lines.slice(0, 7).join("\n") || content;
  }

  // Default: Summarize based on question keywords
  if (
    lowerQuestion.includes("what") ||
    lowerQuestion.includes("about") ||
    lowerQuestion.includes("tell me")
  ) {
    return lines.slice(0, 7).join("\n") || content;
  } else if (lowerQuestion.includes("how") && lowerQuestion.includes("apply")) {
    return (
      lines.filter((line) => line.toLowerCase().includes("apply")).join("\n") ||
      content
    );
  }

  return lines.join("\n") || content;
};

app.post("/ask", async (req, res) => {
  const userQuestion = req.body.question || "";
  console.log(`Processing question: "${userQuestion}"`);

  let response = await translate(userQuestion); // NLP intent matching
  let answer = "";

  if (response && nursingDataCache) {
    const { intent, content } = response;
    lastTopic = intent.split("agent.")[1];

    if (intent === "agent.financial") {
      // Search for financial-related headings
      const financialHeadings = Object.keys(nursingDataCache).filter(
        (heading) =>
          heading.toLowerCase().includes("costs and financial information") ||
          heading.toLowerCase().includes("funding opportunities")
      );
      if (financialHeadings.length > 0) {
        answer = financialHeadings
          .map((heading) => nursingDataCache[heading])
          .join("\n\n");
      } else {
        answer =
          "I couldn't find specific financial information. Please check the program pages for details.";
      }
    } else {
      // Handle other intents (e.g., admissions, greetings)
      answer = summarizeContent(userQuestion, intent, content);
    }
  } else {
    // Fallback logic for None intent or low confidence
    const lowerQuestion = userQuestion.toLowerCase();
    const keywords = lowerQuestion
      .split(" ")
      .filter(
        (word) =>
          word.length > 2 &&
          !["tell", "about", "what", "how", "me"].includes(word)
      );
    let relevantContent = "";

    if (keywords.length > 0) {
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
          break;
        }
      }
    }

    answer = relevantContent
      ? summarizeContent(userQuestion, null, relevantContent.trim())
      : utterances.fallback.response;
  }

  console.log(`Response: "${answer}"`); // Log full response
  res.json({ response: answer }); // Send full response to client
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
