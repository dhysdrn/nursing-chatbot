/**
 * @description
 * Loads environment variables from the .env file and exports
 * key configuration variables used throughout the application,
 * including Astra DB settings and AI API keys.
 * @version 1.0
 */
import dotenv from 'dotenv';

dotenv.config({
    path: "./.env"
})


/**
 * @constant {string|undefined} ASTRA_DB_NAMESPACE - Astra database namespace
 * @constant {string|undefined} ASTRA_DB_COLLECTION - Main collection name
 * @constant {string|undefined} ASTRA_DB_COLLECTION_USERS - Users collection name
 * @constant {string|undefined} ASTRA_DB_COLLECTION_ADMIN - Admin collection name
 * @constant {string|undefined} ASTRA_DB_API_ENDPOINT - Astra API endpoint URL
 * @constant {string|undefined} ASTRA_DB_APPLICATION_TOKEN - Token for authenticating with Astra DB
 * @constant {string|undefined} AI_API_KEY - API key for AI services
 */
export const { 
    ASTRA_DB_NAMESPACE, 
    ASTRA_DB_COLLECTION, 
    ASTRA_DB_COLLECTION_USERS,
    ASTRA_DB_COLLECTION_ADMIN,
    ASTRA_DB_API_ENDPOINT, 
    ASTRA_DB_APPLICATION_TOKEN, 
    AI_API_KEY } = process.env;
