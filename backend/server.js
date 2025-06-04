import express from "express";
import cors from "cors";
import OpenAI from "openai/index.mjs";
import { DataAPIClient } from "@datastax/astra-db-ts";
import { ASTRA_DB_COLLECTION_USERS, ASTRA_DB_NAMESPACE, ASTRA_DB_COLLECTION, ASTRA_DB_COLLECTION_ADMIN, ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN, AI_API_KEY } from './connection.js';
import { addData, addUser } from './addData.js';
import { checkUser } from './checkUser.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cron from 'node-cron';
import { loadSampleData, createCollection } from './loadDb.js';
import rateLimit from "express-rate-limit";
import linksRoutes from './linksEditor.js';

const app = express();
const port = 5002;

app.use(cors());
app.use(express.json());
app.use('/api', linksRoutes);

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
 * @param {object, object} history
 * @returns 
 */
const rag = async (userQuestion, history) => {
  console.log("Attempting AI response...");
  let docContext = "";

  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: userQuestion,
    encoding_format: "float"
  })
  
  //Check DB connection
  try {
    const collection = db.collection(ASTRA_DB_COLLECTION);
    const cursor = collection.find(null, {
      sort: {
        $vector: embedding.data[0].embedding,
      },
      limit: 50
    });

    //check admin DB 
    const admin_collection = db.collection(ASTRA_DB_COLLECTION_ADMIN);
    const admin_cursor = admin_collection.find(null, {
      sort: {
        $vector: embedding.data[0].embedding,
      },
      limit: 10
    });

    //transfer them to an array
    const documents = await cursor.toArray();
    const admin_documents = await admin_cursor.toArray();
    
    //combine the two information from the collections
    const combined_documents = documents.concat(admin_documents);

    //if there was a response, add it to docsMap
    const docsMap = combined_documents?.map(doc => doc.text);

    docContext = JSON.stringify(docsMap);
    //console.log(`${docContext}`);

  } catch (err) {
    //No Response from a DB
    console.log(`Error querying a db... ${err}`)
    docContext = "";
  }

  let template = {
    role: "system", 
    content: `You are an AI assistant who knows everything about Green River College Nursing.
    Use the below context to augment what you know about Green River College Nursing.
    The context will provide you with the most recent data from the Nursing websites.
    If the context doesn't include the information you need, do not answer the question based on existing knowledge and tell the user that you cannot answer the question and give example questions that relate to the user's question in the form of a question they could ask.
    If no answer to the question they asked, and it appears the user is very confused (6+ messsages) suggest that they should email nursing@greenriver.edu .
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

  let newHistory = [];
    for (let i = 0; i < history.length; i++) {
      newHistory.push(history[i]);
    }

  
  //TODO: Add previous messages and questions asked before. 

  //const aiResponse = "";
  //This uses credits, be careful when sending prompts to the AI
  let aiResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    //stream: true,
    messages: [template, ...history]
  })

  //Extracts the text from the AI response
  aiResponse = aiResponse.choices[0].message.content.trim();

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
  if (answer.charAt(0)== '`') {
    return answer.substring(7, answer.length-4)
  } else {
    return answer;
  }
}

// Rate limiting, max 10 requests per IP in 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many submissions from this IP, please try again later.",
    });
  },
});


/**
 * Handles incoming user questions and provides responses based on cached nursing data.
 */
app.post("/ask", async (req, res) => {
  const userQuestion = req.body.question || "";
  const history = req.body.history;
  console.log(`Processing question: "${userQuestion}"`);

  let answer = "";
  //send the question off to OpenAI using pre-exisiting knowledge
  answer = await rag(userQuestion, history);
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
    const collection = await db.collection(ASTRA_DB_COLLECTION_ADMIN);
    const cursor = collection.find({}, { limit: 10 });

    const documents = await cursor.toArray();
    const docsMap = documents.map(doc => ({  _id: doc._id, heading: doc.heading, text: doc.text }));

    res.json(docsMap);
  } catch (err) {
    console.error("Error querying DB:", err);
    res.status(500).json({ error: "Failed to fetch data from Astra DB" });
  }
});

const sanitizeInput = (str) => {
  return str
    .replace(/<script.*?>.*?<\/script>/gi, "") // remove script tags
    .replace(/<\/?[^>]+(>|$)/g, "") // remove other HTML tags
    .replace(/https?:\/\/[^\s]+/g, "") // strip URLs
    .trim();
};
const hasTooManySpecialChars = (text) => {
  // This checks if more than 30% of the content is symbols like $%^&*#@!
  const symbols = text.match(/[^a-zA-Z0-9\s]/g);
  return symbols && symbols.length / text.length > 0.2;
};

const MAX_LENGTH = 1500;

app.post("/admin-data", limiter, async (req, res) => {
  let { heading, content } = req.body;

  if (!heading || !content) {
    return res.status(400).json({ message: "Both heading and content are required." });
  }

  // Check special chars ratio only if content is long enough to avoid false positives
  if (content.length > 10 && hasTooManySpecialChars(content)) {
    return res.status(400).json({ message: "Content contains excessive special characters or symbols." });
  }

  // Sanitize inputs
  heading = sanitizeInput(heading);
  content = sanitizeInput(content);

  // Check length in bytes
  if (Buffer.byteLength(content, 'utf8') > MAX_LENGTH) {
    return res.status(400).json({
      message: `Your content is too long. Please shorten it to fit under the limit.`,
    });
  }

  try {
  await addData(heading, content);
  return res.json({ message: "Data added successfully!" });
} catch (error) {
  console.error("Error adding data:", error);

  // Handle known validation errors (example: if addData throws custom validation errors)
  if (error.name === "ValidationError") {
    return res.status(400).json({ message: error.message || "Validation failed." });
  }

  // Handle database connection errors
  if (error.message && error.message.includes("ECONNREFUSED")) {
    return res.status(503).json({ message: "Database connection refused. Try again later." });
  }

  // Handle permission errors
  if (error.message && error.message.toLowerCase().includes("permission")) {
    return res.status(403).json({ message: "Permission denied. You don't have access." });
  }

  // Default fallback
  return res.status(500).json({ message: "An unknown error occurred. Please try again later." });
}
});

// Update an existing document by _id
app.put("/admin-data/:id", async (req, res) => {
  const { id } = req.params;
  const { heading, content } = req.body;

  if (!heading || !content) {
    return res.status(400).json({ message: "Both heading and content are required." });
  }

  try {
    const collection = await db.collection(ASTRA_DB_COLLECTION_ADMIN);
    // Update document by _id
    const result = await collection.updateOne(
      { _id: id },
      { $set: { heading, text: content} }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Document not found or no changes made." });
    }

    return res.json({ message: "Document updated successfully." });
  } catch (error) {
    console.error("Error updating document:", error);
    return res.status(500).json({ message: "Error updating document." });
  }
});

// Delete a document by _id
app.delete("/admin-data/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const collection = await db.collection(ASTRA_DB_COLLECTION_ADMIN);
    const result = await collection.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Document not found." });
    }

    return res.json({ message: "Document deleted successfully." });
  } catch (error) {
    console.error("Error deleting document:", error);
    return res.status(500).json({ message: "Error deleting document." });
  }
});

app.get("/last-scraped", async (req, res) => {
  try {
    const collection = db.collection(ASTRA_DB_COLLECTION);
    
    // Get the most recent document by timestamp
    const cursor = collection.find({}, {
      sort: { timestamp: -1 },
      limit: 1,
    });

    const [latestDoc] = await cursor.toArray();

    if (latestDoc && latestDoc.timestamp) {
      res.json({ lastScraped: latestDoc.timestamp });
    } else {
      res.status(404).json({ message: "No timestamp found." });
    }
  } catch (err) {
    console.error("Error fetching last scraped timestamp:", err);
    res.status(500).json({ message: "Failed to fetch last scraped timestamp." });
  }
});

app.post("/create-user", async (req, res) => {
  const { username, password, password2 } = req.body;

  // Basic Authentication
  if (password != password2) {
    return res.json({ message: "Both passwords must be the same."})
  }
  else if (!username || !password || !password2) {
    return res.json({ message: "Both username and both passwords are required." });
  }

  // Check if the user already exists
  const user = await checkUser(username);
  if (user) {
    return res.json({ message: "User already exists." });
  }

  try {
    await addUser(username, password);
    return res.status(201).json({ message: "User added successfully!" });
  } catch (error) {
    console.error("Error checking data:", error);
    return res.json({ message: `Error adding user. Please try again later.` });
  }
});

app.post("/user-login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ message: "Both username and password are required." });
  }
  try {
    const user = await checkUser(username);
    //console.log(user);
    if (!user) {
      return res.json({ message: 'User or password is wrong.' });
    } else {
      // Check if password exists
      let passwordMatched;
      try {
      passwordMatched = await bcrypt.compare(password, user["password"]);
      } catch (error) {
          console.error("User doesn't exist", error);
          return res.json({ message: 'User or password is wrong.' });
      }
      //console.log(passwordMatched);
      // Check if password matches
      if (passwordMatched) {
        const token = jwt.sign({ userId: user["_id"] }, 'your-secret-key', {
          expiresIn: '1h',
          });
        return res.status(201).json({ message: "Data successfully matched!", token });
      } else {
        return res.json({ message: 'User or password is wrong.' });
      }
    }

  } catch (error) {
    console.error("Error checking data:", error);
    return res.json({ message: "Error checking data. Please try again later." });
  }
});

app.post("/db-check", async (req, res) => {
  try { 
    // Check if the usertable exists 
    const collection = await db.collection(ASTRA_DB_COLLECTION_USERS);
    try {
      const cursor = await collection.findOne()
      res.status(200).json({ message: "User table checked successfully. (Exists)"});
    } catch (no_exist) {
      res.status(202).json({ message: "User table checked successfully. (Doesn't exist)"});
    }
  } catch (err) {
    console.error("Failed to check user table:", err);
    res.status(500).json({ message: "Failed to check user table."});
  }
});

app.post("/reload-data", async (req, res) => {
  try {
    await createCollection(ASTRA_DB_COLLECTION);
    await loadSampleData({ wipe: true });
    res.json({ message: "Data reloaded successfully." });
  } catch (err) {
    console.error("Failed to reload data:", err);
    res.status(500).json({ message: "Failed to reload data." });
  }
});

// Every month at 2 AM
cron.schedule('0 2 1 * *', async () => {
  console.log("Scheduled data reload started...");
  try {
    await createCollection(ASTRA_DB_COLLECTION);
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
