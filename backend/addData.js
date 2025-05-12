import { DataAPIClient } from "@datastax/astra-db-ts";
import OpenAI from "openai";
import "dotenv/config";

// ENV variables
const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  AI_API_KEY
} = process.env;

// OpenAI instance
const openai = new OpenAI({ apiKey: AI_API_KEY });

// Astra DB setup
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

// Function to create the "admindata" collection if it doesn't exist
const createAdminDataCollection = async () => {
  try {
    // Check if the collection exists
    const collections = await db.listCollections();
    if (!collections.includes("admindata")) {
      const res = await db.createCollection("admindata", {
        vector: {
          dimension: 1536,
          metric: "dot_product",
        },
      });
      console.log("Admin data collection created:", res);
    } else {
      console.log("Collection 'admindata' already exists.");
    }
  } catch (error) {
    console.error("Error creating admin data collection:", error);
  }
};

// Function to add admin data into the "admindata" collection
const addData = async (heading, content) => {
  try {
    // Generate embeddings for the content using OpenAI
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: content,
      encoding_format: "float",
    });

    const vector = embedding.data[0].embedding;

    // Insert data into the "admindata" collection
    const collection = await db.collection("admindata");
    const res = await collection.insertOne({
      $vector: vector,
      heading,
      text: content,
    });

    console.log("Inserted admin data:", res);
  } catch (error) {
    console.error("Error inserting admin data:", error);
  }
};

// Ensure the "admindata" collection exists
createAdminDataCollection();

export { addData };
