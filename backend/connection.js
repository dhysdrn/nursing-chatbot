import dotenv from 'dotenv';

dotenv.config({
    path: "./config.env"
})

export const { AI_API_KEY } = process.env;
