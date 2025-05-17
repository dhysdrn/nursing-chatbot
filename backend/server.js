import express from "express";
import cors from "cors";
import OpenAI from "openai/index.mjs";
//import { streamText, StreamingTextResponse } from "ai";
import { DataAPIClient } from "@datastax/astra-db-ts";
import { ASTRA_DB_NAMESPACE, ASTRA_DB_COLLECTION, ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN, AI_API_KEY } from './connection.js';
import { addData } from './addData.js';
import cron from 'node-cron';
import { loadSampleData, createCollection } from './loadDb.js';



const app = express();
const port = 5002;

app.use(cors());
app.use(express.json());

let nursingDataCache = null;
let lastTopic = null;

// OpenAI instance
const openai = new OpenAI({ apiKey: AI_API_KEY });

// Astra DB connetion
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });


/**
 * 
 * @param {string} userQuestion 
 * @returns 
 */
const rag = async (userQuestion) => {
  console.log("Attempting AI response...");
  let docContext = "";

  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: userQuestion,
    encoding_format: "float"
  })
  
  //Check DB connection
  try {
    const collection = await db.collection(ASTRA_DB_COLLECTION);
    const cursor = collection.find(null, {
      sort: {
        $vector: embedding.data[0].embedding,
      },
      limit: 50
    });

    const documents = await cursor.toArray();

    //if there was a response, add it to docsMap
    const docsMap = documents?.map(doc => doc.text);

    docContext = JSON.stringify(docsMap);
    //console.log(`${docContext}`);

  } catch (err) {
    //No Response from DB
    console.log(`Error querying db... ${err}`)
    docContext = "";
  }

  const template = {
    role: "system", 
    content: `You are an AI assistant who knows everything about Green River College Nursing.
    Use the below context to augment what you know about Green River College Nursing.
    The context will provide you with the most recent data from the Nursing websites.
    If the context doesn't include the information you need, do not answer the question based on existing knowledge and tell the user that you cannot answer the question and give example questions that relate to the user's question in the form of a question they could ask.
    If no answer to the question they asked, suggest that they should email nursing@greenriver.edu .
    Format responses using markdown where applicable and don't return images.
    Give a response as an HTML format. Try not to add titles. If links are provided, make sure they go into a new tab.
    --------------------
    START CONTEXT
    ${docContext}
    END CONTEXT
    --------------------
    QUESTION: ${userQuestion}
    --------------------
    `
  }

  //TODO: Add previous messages and questions asked before. 

  //const aiResponse = "";
  //This uses credits, be careful when sending prompts to the AI
  let aiResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    //stream: true,
    messages: [template]
  })

  //Extracts the text from the AI response
  aiResponse = aiResponse.choices[0].message.content.trim();
  //console.log(aiResponse);

  //TODO: Add stream to make the text load as the user is getting the response.
  // const stream = OpenAIStream(response);
  // return new StreamingTextResponse(stream);
  return aiResponse;
}


/**
 * Removes the filler information the AI gives us.
 * 
 * @param {string} answer 
 * @returns 
 */
const removeFiller = (answer) => {
  return answer.substring(7, answer.length-4)
}

/**
 * Handles incoming user questions and provides responses based on cached nursing data.
 */
app.post("/ask", async (req, res) => {
  const userQuestion = req.body.question || "";
  console.log(`Processing question: "${userQuestion}"`);

  let response = "";
  let answer = "";
  //send the question off to OpenAI using pre-exisiting knowledge
  answer = await rag(userQuestion);
  //Filters out the ```html at the start and the end
  answer = removeFiller(answer);

  console.log(`Response: "${answer}..."`);
  res.json({ response: answer });
});

/**
 * Endpoint to fetch documents from Astra DB for the frontend to display in a table
 */
app.get("/documents", async (req, res) => {
  try {
    const collection = await db.collection(ASTRA_DB_COLLECTION);
    const cursor = collection.find({}, { limit: 10 });

    const documents = await cursor.toArray();
    const docsMap = documents.map(doc => ({ heading: doc.heading, text: doc.text }));

    res.json(docsMap);
  } catch (err) {
    console.error("Error querying DB:", err);
    res.status(500).json({ error: "Failed to fetch data from Astra DB" });
  }
});

// POST endpoint to add admin data
app.post("/admin-data", async (req, res) => {
  const { heading, content } = req.body;

  if (!heading || !content) {
    return res.status(400).json({ message: "Both heading and content are required." });
  }
  try {
    await addData(heading, content);
    return res.json({ message: "Data added successfully!" });
  } catch (error) {
    console.error("Error adding data:", error);
    return res.status(500).json({ message: "Error adding data. Please try again later." });
  }
});

app.post("/reload-data", async (req, res) => {
  try {
    await createCollection();
    await loadSampleData({ wipe: true });
    res.json({ message: "Data reloaded successfully." });
  } catch (err) {
    console.error("Failed to reload data:", err);
    res.status(500).json({ message: "Failed to reload data." });
  }
});

// Every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log("Scheduled data reload started...");
  try {
    await createCollection();
    await loadSampleData({ wipe: true }); 
    console.log("Scheduled data reload complete.");
  } catch (err) {
    console.error("Scheduled reload failed:", err);
  }
});

/**
 * Starts the Express server.
 */
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
