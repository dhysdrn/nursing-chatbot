import { DataAPIClient } from "@datastax/astra-db-ts";
// import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
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
    OPENAI_API_KEY 
} = process.env;

// OpenAI instance
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// URLs to scrape
const nursingData = [
    'https://www.greenriver.edu/students/academics/degrees-programs/nursing/index.html',
    'https://www.greenriver.edu/students/academics/degrees-programs/nursing/bsn/bsnfaqs.html',
    'https://www.greenriver.edu/students/academics/degrees-programs/nursing/practical-nursing/application/faqs.html'
];

// Astra DB setup
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

// Text splitter config
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100
});

// Create collection with vector support
const createCollection = async (similarityMetric = "dot_product") => {
    const res = await db.createCollection(ASTRA_DB_COLLECTION, {
        vector: {
            dimension: 1536,
            metric: similarityMetric
        }
    });
    console.log("Collection created:", res);
};

// Scrape and load data into DB
const loadSampleData = async () => {
    const collection = await db.collection(ASTRA_DB_COLLECTION);
    const { nursingData } = await scrapeData();

    for (const [heading, content] of Object.entries(nursingData)) {
        const chunks = await splitter.splitText(content);

        for (const chunk of chunks) {
            const embedding = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: chunk,
                encoding_format: "float"
            });

            const vector = embedding.data[0].embedding;

            const res = await collection.insertOne({
                $vector: vector,
                heading,
                text: chunk,
                heading
            });

            console.log("Inserted chunk for heading:", heading);
        }
    }
};


// // Scraper
// const scrapePage = async (url) => {
//     const loader = new PuppeteerWebBaseLoader(url, {
//         launchOptions: {
//             headless: true
//         },
//         gotoOptions: {
//             waitUntil: "domcontentloaded"
//         },
//         evaluate: async (page, browser) => {
//             const result = await page.evaluate(() => document.body.innerHTML);
//             await browser.close();
//             return result;
//         }
//     });

//     const html = await loader.scrape();
//     return html?.replace(/<[^>]*>?/gm, '');
// };

// Start everything
createCollection().then(() => loadSampleData()).catch(console.error);
