/**
 * @description
 * Handles user authentication-related database operations.
 * Provides a function to check if a user exists in the Astra DB users collection.
 * Connects to Astra DB using provided environment variables and uses OpenAI client setup.
 * @version 1.0
 */
import { DataAPIClient } from "@datastax/astra-db-ts";
import OpenAI from "openai";
import bcrypt from 'bcrypt';
import { ASTRA_DB_NAMESPACE, ASTRA_DB_COLLECTION, ASTRA_DB_COLLECTION_USERS, ASTRA_DB_COLLECTION_ADMIN, ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN, AI_API_KEY } from './connection.js';

// OpenAI instance
const openai = new OpenAI({ apiKey: AI_API_KEY });

// Astra DB setup
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });


/**
 * @function checkUser
 * @description
 * Queries the Astra DB users collection for a document matching the given username.
 * Returns the user document if found, or null if no user exists or an error occurs.
 *
 * @param {string} username - The username to search for.
 * @returns {Promise<Object|null>} The user object if found, otherwise null.
 */
const checkUser = async (username) => {
    try {
        // Check if the usertable exists 
        const collection = await db.collection(ASTRA_DB_COLLECTION_USERS);

        // Search for the user given
        const cursor = await collection.find({ username: username });
        const docs = await cursor.toArray();

        if (docs) {
          let user = docs[0];
          //console.log(user);
          return user;
        } else {
          // No user was found 
          return null;
        }

      } catch (error) {
        // Error from DB
        console.error("Error reading from DB:", error);
        return null;
      }
}

/**
 * @function checkEmail
 * @description
 * Queries the Astra DB users collection for a document matching the given email.
 * Returns the user document if found, or null if no user exists or an error occurs.
 *
 * @param {string} email - The email to search for.
 * @returns {Promise<Object|null>} The user object if found, otherwise null.
 */
const checkEmail = async (email) => {
    try {
        // Check if the usertable exists 
        const collection = await db.collection(ASTRA_DB_COLLECTION_USERS);

        // Search for the user given
        const cursor = await collection.find({ email: email });
        const docs = await cursor.toArray();

        if (docs) {
          let user = docs[0];
          return user;
        } else {
          // No user was found 
          return null;
        }

      } catch (error) {
        // Error from DB
        console.error("Error reading from DB:", error);
        return null;
      }
}

export { checkUser, checkEmail };