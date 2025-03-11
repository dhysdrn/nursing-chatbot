import { containerBootstrap } from "@nlpjs/core";
import { Nlp } from "@nlpjs/nlp";
import { LangEn } from "@nlpjs/lang-en-min";
import { scrapeData } from "./scraper.js";
import { utterances } from "./db/nlpUtterances.js";

let nlpInstance = null;
let nursingDataCache = null;

const initializeNlp = async () => {
  const scrapedData = await scrapeData();
  if (!scrapedData || !scrapedData.nursingData) {
    console.error("❌ Failed to initialize NLP with scraped data");
    return false;
  }
  nursingDataCache = scrapedData.nursingData;
  console.log(
    "✅ Available headings in nursingDataCache:",
    Object.keys(nursingDataCache)
  ); 

  const container = await containerBootstrap();
  container.use(Nlp);
  container.use(LangEn);
  nlpInstance = container.get("nlp");
  nlpInstance.settings.autoSave = false;

  const corpus = {
    name: "Corpus",
    locale: "en-US",
    data: [],
  };

  for (const [key, value] of Object.entries(utterances)) {
    const intent = `agent.${key}`;
    const utterancesList = value.phrases;
    const answer =
      value.response ||
      (nursingDataCache[value.heading]
        ? nursingDataCache[value.heading]
        : "Sorry, I couldn’t find that info in the scraped data. Try asking about programs, admissions, or events!");
    corpus.data.push({
      intent,
      utterances: utterancesList,
      answers: [{ answer }],
    });
  }

  await nlpInstance.addCorpus(corpus);
  await nlpInstance.train();
  console.log("✅ NLP initialized with utterances");
  return true;
};

export const translate = async (userText) => {
  if (!nlpInstance || !nursingDataCache) {
    const initialized = await initializeNlp();
    if (!initialized) return "Sorry, I couldn’t load the nursing program data.";
  }

  const response = await nlpInstance.process("en", userText);
  const confidence = response.score;
  const intent = response.intent;
  console.log(
    `NLP matched intent: ${intent} with confidence: ${confidence}, text: "${userText}"`
  );

  if (intent === "None" || confidence < 0.6) {
    return null;
  } else {
    return { intent, content: response.answer };
  }
};

initializeNlp();
