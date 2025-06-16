/**
 * @description
 * This module handles integration with Astra DB and OpenAI to load
 * nursing data scraped from a website into a vector-enabled Astra DB collection.
 * It creates necessary collections, splits text data into chunks,
 * generates embeddings for each chunk, and updates the database accordingly.
 * Obsolete entries are deleted, and metadata is tracked.
 * 
 * It also manages user collection creation separately and uses concurrency
 * control and progress bars for smooth operation.
 * @version 1.0
 */
import { DataAPIClient } from "@datastax/astra-db-ts";
import OpenAI from "openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import "dotenv/config";
import { scrapeData } from "./scraper.js";
import pLimit from "p-limit";
import cliProgress from "cli-progress";
import crypto from "crypto";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  AI_API_KEY,
} = process.env;

const openai = new OpenAI({ apiKey: AI_API_KEY });
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

/**
 * @function hashText
 * @description
 * Generates a SHA-256 hash for the given text input.
 * Used to detect changes and avoid redundant embedding operations.
 *
 * @param {string} text - The input text to hash.
 * @returns {string} The resulting hex hash string.
 */
const hashText = (text) => crypto.createHash("sha256").update(text).digest("hex");

/**
 * @function createUserCollection
 * @description
 * Checks if a user collection exists in Astra DB and creates it if missing.
 * Logs status to the console.
 *
 * @param {string} collectionName - The name of the user collection to create.
 * @returns {Promise<void>}
 */
const createUserCollection = async (collectionName) => {
  const collections = await db.listCollections();
  const exists = collections.find((c) => c.name === collectionName);
  if (!exists) {
    await db.createCollection(collectionName);
    console.log("✅ User Collection created.");
  } else {
    console.log("ℹ️ User Collection already exists.");
  }
};

/**
 * @function createCollection
 * @description
 * Checks if a vector collection exists in Astra DB and creates it if missing.
 * The vector collection is configured with dimension 1536 and dot product metric.
 * Logs status to the console.
 *
 * @param {string} collectionName - The name of the vector collection to create.
 * @returns {Promise<void>}
 */
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


/**
 * @function loadSampleData
 * @description
 * Loads nursing data into the Astra DB vector collection.
 * Optionally wipes the collection before loading.
 * Scrapes fresh data, splits text into chunks, computes embeddings,
 * and upserts documents with concurrency control and progress reporting.
 * Skips unchanged chunks by hash comparison and deletes obsolete documents.
 * Updates metadata document with last scrape timestamp.
 *
 * @param {Object} [options]
 * @param {boolean} [options.wipe=false] - Whether to delete all existing documents before loading.
 * @returns {Promise<void>}
 */
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

  const existingDocsCursor = await collection.find({}, { projection: { _id: 1, hash: 1 } });
  const existingDocs = await existingDocsCursor.toArray();

  if (!Array.isArray(existingDocs)) {
    console.warn("⚠️ existingDocs is not an array:", existingDocs);
  }

  const existingMap = new Map(existingDocs.map(doc => [doc._id, doc.hash]));
  const allExistingIds = new Set(existingMap.keys()); 
  const usedIds = new Set(); // tracks used IDs for deletion check later

  console.log(`ℹ️ Found ${existingDocs.length} existing documents in the collection.`);

  let updated = 0, skipped = 0, inserted = 0;
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
    const bar = new cliProgress.SingleBar({
      format: `⏳ Embedding |{bar}| {percentage}% || {value}/{total} chunks`,
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true
    }, cliProgress.Presets.shades_classic);
    bar.start(chunks.length, 0);

    const embeddedChunks = await Promise.all(chunks.map((chunk, i) =>
      limit(async () => {
        const _id = `${heading}_${i}`.replace(/\s+/g, "_");
        usedIds.add(_id);
        const hash = hashText(chunk);
        if (existingMap.get(_id) === hash) {
          skipped++;
          bar.increment();
          return null;
        }

        const embedding = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: chunk,
          encoding_format: "float",
        });
        bar.increment();

        return {
          _id,
          $vector: embedding.data[0].embedding,
          heading,
          text: chunk,
          url,
          timestamp,
          hash,
        };
      })
    ));

    bar.stop();

    const toUpsert = embeddedChunks.filter(Boolean);
    for (const doc of toUpsert) {
      const { _id, ...updateFields } = doc;
      await collection.updateOne(
        { _id },
        { $set: updateFields },
        { upsert: true }
      );
    }

    headingCount++;
    inserted += toUpsert.length;
    updated += toUpsert.length;
    console.log(`[${headingCount}/${totalHeadings}] "${heading}" done. Inserted/Updated: ${toUpsert.length}`);
  }

  const toDelete = [...allExistingIds].filter(id => !usedIds.has(id));
  if (toDelete.length > 0) {
    await Promise.all(toDelete.map(id => collection.deleteOne({ _id: id })));
    console.log(`Removed ${toDelete.length} obsolete documents.`);
  } else {
    console.log(`No obsolete documents to delete.`);
  }

  console.log(`✅ Data load complete. Skipped: ${skipped}, Inserted/Updated: ${inserted}`);

  await collection.updateOne(
    { _id: "meta_last_scraped" },
    { $set: { lastScraped: new Date().toISOString() } },
    { upsert: true }
  );
};

export { createCollection, createUserCollection, loadSampleData };
