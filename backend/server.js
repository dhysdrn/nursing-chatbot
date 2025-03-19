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

/**
 * Fetches and refreshes the nursing data cache from the scraper.
 */
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

// Helper function to split long text into shorter lines at logical breaks
const splitLongText = (text, maxLength = 60) => {
  if (text.length <= maxLength) return text;
  const parts = [];
  let currentLine = "";
  const sentences = text.split(/(?<=[.,])\s+/); // Split at periods/commas followed by space
  for (const sentence of sentences) {
    if ((currentLine + sentence).length <= maxLength) {
      currentLine += (currentLine ? " " : "") + sentence;
    } else {
      if (currentLine) parts.push(currentLine);
      currentLine = sentence;
      if (currentLine.length > maxLength) {
        // If a single sentence is too long, split at spaces
        const words = currentLine.split(" ");
        let tempLine = "";
        for (const word of words) {
          if ((tempLine + word).length <= maxLength) {
            tempLine += (tempLine ? " " : "") + word;
          } else {
            parts.push(tempLine);
            tempLine = word;
          }
        }
        if (tempLine) currentLine = tempLine;
      }
    }
  }
  if (currentLine) parts.push(currentLine);
  return parts.join("\n");
};

/**
 * Summarizes the content based on user question intent.
 * @param {string} question - The user's question.
 * @param {string} intent - The identified intent of the question.
 * @param {string} content - The content relevant to the question.
 * @returns {string} A summarized response based on the question and content.
 */
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
        const sectionLines = nursingDataCache[heading]
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => splitLongText(line, 60)); // Split lines longer than 60 chars
        combinedContent += `${heading}:\n\n${sectionLines.join("\n")}\n\n`;
      }
    });
    return (
      combinedContent.trim() || "Sorry, I couldn’t find detailed degree info."
    );
  }

  const formattedContent = lines
    .map((line) => splitLongText(line, 60))
    .join("\n");

  if (
    lowerQuestion.includes("what") ||
    lowerQuestion.includes("about") ||
    lowerQuestion.includes("tell me") ||
    lowerQuestion === "admissions" ||
    lowerQuestion === "degrees"
  ) {
    return formattedContent;
  } else if (
    lowerQuestion.includes("how") &&
    (lowerQuestion.includes("apply") || lowerQuestion.includes("get in"))
  ) {
    return (
      splitLongText(
        "To apply, visit the Green River College website for the application process and requirements.",
        60
      ) +
      "\n" +
      splitLongText(
        "You can also attend an Application Workshop—check the Events Page for dates!",
        60
      )
    );
  } else if (lowerQuestion.includes("where")) {
    if (lastTopic === "events") {
      return splitLongText(
        "Find event details on the Events Page of the Green River College website!",
        60
      );
    } else if (lastTopic === "admissions") {
      return splitLongText(
        "Check the Green River College website for admissions info or email nursing@greenriver.edu.",
        60
      );
    }
    return splitLongText(
      "Visit the Green River College website for more details.",
      60
    );
  } else if (lowerQuestion.includes("more")) {
    return formattedContent;
  }
  return formattedContent;
};

/**
 * Handles incoming user questions and provides responses based on cached nursing data.
 */
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
      : splitLongText("Hmm, I couldn’t find that.") +
        "\n" +
        splitLongText(
          "Try asking about programs, admissions, degrees, or events!",
          60
        );
  } else {
    answer =
      splitLongText("Sorry, I couldn’t load the data.") +
      "\n" +
      splitLongText("Please try again!");
  }

  console.log(`Response: "${answer.slice(0, 100)}..."`);
  res.json({ response: answer });
});

/**
 * Starts the Express server.
 */
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
