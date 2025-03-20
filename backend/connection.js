import dotenv from 'dotenv';

dotenv.config({
    path: "./.env"
})

export const { AI_API_KEY } = process.env;
