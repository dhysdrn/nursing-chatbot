import dotenv from 'dotenv';

dotenv.config({
    path: "./.env"
})

export const { 
    ASTRA_DB_NAMESPACE, 
    ASTRA_DB_COLLECTION, 
    ASTRA_DB_COLLECTION_ADMIN,
    ASTRA_DB_API_ENDPOINT, 
    ASTRA_DB_APPLICATION_TOKEN, 
    AI_API_KEY } = process.env;
