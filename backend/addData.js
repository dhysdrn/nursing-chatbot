/**
 * @description
 * Provides functions to insert data into Astra DB collections for admin and user management.
 * Adds vector-embedded admin content into the admin collection.
 * Adds new users with bcrypt-hashed passwords into the user collection.
 * Connects to Astra DB and OpenAI using environment variables.
 * @version 1.0
 */
import { DataAPIClient } from "@datastax/astra-db-ts";
import OpenAI from "openai";
import "dotenv/config";
import bcrypt from 'bcrypt';

// ENV variables
const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  ASTRA_DB_COLLECTION_USERS,
  ASTRA_DB_COLLECTION_ADMIN,
  AI_API_KEY
} = process.env;

// OpenAI instance
const openai = new OpenAI({ apiKey: AI_API_KEY });

// Astra DB setup
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });


/**
 * @function addData
 * @description Generates embeddings for the provided content and inserts it into the admin collection with the heading and text. Adds admin data into the admin collection
 * 
 * @param {string} heading - The heading or title associated with the content.
 * @param {string} content - The text content to embed and store.
 * @returns {Promise<void>}
 */
const addData = async (heading, content) => {
  try {
    // Generate embeddings for the content using OpenAI
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: content,
      encoding_format: "float",
    });

    const vector = embedding.data[0].embedding;

    // Insert data into the admin collection
    const collection = await db.collection(ASTRA_DB_COLLECTION_ADMIN);
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


/**
 * @function addUser
 * @description Adds a new user to the users collection with the username, email, and bcrypt-hashed password.
 * 
 * @param {string} username - The username for the new user.
 * @param {string} email - The email for the new user.
 * @param {string} password - The plaintext password for the new user.
 * @returns {Promise<void>}
 */
const addUser = async (username, email, password) => {
  try {
    // Insert data into the user collection
    const collection = await db.collection(ASTRA_DB_COLLECTION_USERS);

    // Hash password for security
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const res = await collection.insertOne({
      username,
      email,
      password: hashedPassword,
    });

    console.log("Inserted admin:", res);
  } catch (error) {
    console.error("Error inserting admin:", error);
  }
};

export { addData, addUser };
