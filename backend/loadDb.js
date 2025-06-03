import { DataAPIClient } from "@datastax/astra-db-ts";
import OpenAI from "openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import "dotenv/config";
import { scrapeData } from "./scraper.js";
import pLimit from "p-limit";
import cliProgress from "cli-progress";


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

// Exported function to create a user collection
const createUserCollection = async (collectionName) => {
    const collections = await db.listCollections();
    const exists = collections.find((c) => c.name === collectionName);
  if (!exists) {
    await db.createCollection(collectionName);
    console.log("✅ User Collection created.");
  } else {
    console.log("ℹ️ User Collection already exists.");
  }
}

// Exported function to create the collection
const createCollection = async (collectionName) => {
  const collections = await db.listCollections();
  const exists = collections.find((c) => c.name === collectionName);
  if (!exists) {
    await db.createCollection(collectionName, {
      vector: {
        dimension: 1536,
        metric: "dot_product",
      },
    });
    console.log("✅ Collection created.");
  } else {
    console.log("ℹ️ Collection already exists.");
  }
};


const loadSampleData = async ({ wipe = false } = {}) => {
  const collection = await db.collection(ASTRA_DB_COLLECTION);

  if (wipe) {
    await collection.deleteMany({});
    console.log("🧹 Collection wiped.");
  }

  const scraped = await scrapeData();
  const data = scraped?.nursingData ?? scraped;
  const timestamp = new Date().toISOString();

  const limit = pLimit(5); 

  let headingCount = 0;
  const totalHeadings = Object.keys(data).length;

  for (const [heading, value] of Object.entries(data)) {
    const text = typeof value === "string" ? value : value.text;
    const url = typeof value === "string" ? null : value.url;

    if (!text || typeof text !== "string" || !text.trim()) {
      console.warn(`⚠️ Skipping invalid entry: ${heading}`);
      continue;
    }

    const chunks = await splitter.splitText(text);

    // Initialize progress bar for this heading
    const bar = new cliProgress.SingleBar({
      format: `⏳ Embedding |${'{bar}'}| {percentage}% || {value}/{total} chunks`,
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true
    }, cliProgress.Presets.shades_classic);
    bar.start(chunks.length, 0);

    const embeddedChunks = await Promise.all(chunks.map((chunk, idx) =>
      limit(async () => {
        const embedding = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: chunk,
          encoding_format: "float",
        });
        bar.increment(); 
        return {
          chunk,
          vector: embedding.data[0].embedding,
        };
      })
    ));

    bar.stop(); 

    const documents = embeddedChunks.map((item, i) => ({
      _id: `${heading}_${i}`.replace(/\s+/g, "_"),
      $vector: item.vector,
      heading,
      text: item.chunk,
      url,
      timestamp,
    }));

    if (documents.length > 0) {
      await collection.insertMany(documents);
      headingCount++;
      console.log(`📦 [${headingCount}/${totalHeadings}] Inserted ${documents.length} chunks for "${heading}" from ${url}`);
    }
  }

  console.log("✅ Data load complete.");
};


export { createCollection, createUserCollection, loadSampleData };
