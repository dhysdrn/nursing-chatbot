import { DataAPIClient } from "@datastax/astra-db-ts";
import OpenAI from "openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import "dotenv/config";
import { scrapeData } from "./scraper.js";

// ENV variables
const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  AI_API_KEY,
} = process.env;

// OpenAI instance
const openai = new OpenAI({ apiKey: AI_API_KEY });

// Astra DB setup
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

// Text splitter config
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

// ✅ Exported function to create the collection
const createCollection = async (similarityMetric = "dot_product") => {
  const collections = await db.listCollections();
  const exists = collections.find((c) => c.name === ASTRA_DB_COLLECTION);
  if (!exists) {
    await db.createCollection(ASTRA_DB_COLLECTION, {
      vector: {
        dimension: 1536,
        metric: similarityMetric,
      },
    });
    console.log("✅ Collection created.");
  } else {
    console.log("ℹ️ Collection already exists.");
  }
};

// ✅ Exported function to load data
const loadSampleData = async ({ wipe = false } = {}) => {
  const collection = await db.collection(ASTRA_DB_COLLECTION);

  if (wipe) {
    await collection.deleteMany({});
    console.log("🧹 Collection wiped.");
  }

  const scraped = await scrapeData(); // { heading: { text, url } }
  const data = scraped?.nursingData ?? scraped;
  const timestamp = new Date().toISOString();

  for (const [heading, value] of Object.entries(data)) {
    const text = typeof value === "string" ? value : value.text;
    const url = typeof value === "string" ? null : value.url;

    if (!text || typeof text !== "string" || !text.trim()) {
      console.warn(`⚠️ Skipping invalid entry: ${heading}`);
      continue;
    }

    const chunks = await splitter.splitText(text);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
        encoding_format: "float",
      });

      const vector = embedding.data[0].embedding;
      const docId = `${heading}_${i}`.replace(/\s+/g, "_");

      await collection.insertOne({
        _id: docId,
        $vector: vector,
        heading,
        text: chunk,
        url,
        timestamp,
      });

      console.log(`🧩 Inserted chunk #${i} for "${heading}"`);
    }
  }

  console.log("✅ Data load complete.");
};

// ❌ No automatic execution here anymore!

// ✅ Only exports
export { createCollection, loadSampleData };
