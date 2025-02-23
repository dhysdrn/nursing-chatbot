const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
const PORT = 5000;


app.get("/", (req, res) => {
    res.send("Welcome to the GRC Nursing ChatBot API! Use the /chat endpoint.");
});
app.use(express.json());
app.use(cors());

const BASE_URL = "https://www.greenriver.edu";
const NURSING_PAGE = `${BASE_URL}/academics/areas-of-study/nursing/`;

// Basic chatbot responses for greetings
const defaultResponses = {
    "hi": "Hello! How can I assist you with nursing program questions?",
    "hello": "Hi there! Ask me anything about the GRC nursing program.",
    "who are you": "I'm the Green River College Nursing ChatBot, here to help you!",
    "help": "You can ask me anything about Green River College's nursing program!"
};

// Function to scrape FAQs or relevant info
const scrapeNursingPage = async () => {
    try {
        const { data } = await axios.get(NURSING_PAGE);
        const $ = cheerio.load(data);
        let faqs = {};

        // Example: Finding FAQ questions and answers on the page
        $(".accordion-title").each((index, element) => {
            const question = $(element).text().trim();
            const answer = $(element).next(".accordion-content").text().trim();
            faqs[question.toLowerCase()] = answer;
        });

        return faqs;
    } catch (error) {
        console.error("Error scraping Green River College site:", error);
        return {};
    }
};

// Chatbot route
app.post("/chat", async (req, res) => {
    const userQuestion = req.body.question.toLowerCase();

    // Check predefined responses
    if (defaultResponses[userQuestion]) {
        return res.json({ answer: defaultResponses[userQuestion] });
    }

    // Fetch latest FAQs
    const faqs = await scrapeNursingPage();

    // Search for a relevant answer
    for (let question in faqs) {
        if (userQuestion.includes(question)) {
            return res.json({ answer: faqs[question] });
        }
    }

    // If no answer is found, provide faculty email
    return res.json({
        answer: "I'm sorry, I couldn't find an answer for that. You can reach out to the Nursing Department at nursing@greenriver.edu for more information."
    });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
