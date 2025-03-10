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

const summarizeContent = (question, intent, content, filterKeywords = []) => {
  if (!content || typeof content !== "string") {
    return "Sorry, I couldn’t find specific details for that question.";
  }

  const lines = content.split("\n").filter((line) => line.trim());

  // Apply filter if keywords are provided
  if (filterKeywords.length > 0) {
    const relevantLines = lines.filter((line) =>
      filterKeywords.some((keyword) =>
        line.toLowerCase().includes(keyword.toLowerCase())
      )
    );
    return relevantLines.length > 0
      ? relevantLines.join("\n")
      : "I couldn’t find specific information for that query.";
  }

  // Default response for unfiltered content
  return lines.slice(0, 7).join("\n") || content;
};

app.post("/ask", async (req, res) => {
  const userQuestion = req.body.question || "";
  console.log(`Processing question: "${userQuestion}"`);

  let response = await translate(userQuestion); // Fixed: userText -> userQuestion
  let answer = "";

  if (response && nursingDataCache) {
    const { intent, content } = response;
    lastTopic = intent.split("agent.")[1];
    const filterKeywords = utterances[lastTopic]?.filter || [];
    answer = summarizeContent(userQuestion, intent, content, filterKeywords);
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
