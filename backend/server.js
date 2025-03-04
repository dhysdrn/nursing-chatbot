const express = require('express');
const cors = require('cors');
const scrapeData = require('./scraper');

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

// POST endpoint to handle user questions 
app.post('/ask', async (req, res) => {
  const userQuestion = req.body.question.toLowerCase();

  if (userQuestion.includes('admissions')) {
    const scrapedData = await scrapeData();
    if (scrapedData) {
      res.json({ response: scrapedData.admissionsInfo || "Sorry, I couldn't find the admissions info." });
    } else {
      res.json({ response: "Sorry, something went wrong while fetching the information." });
    }
  } else {
    res.json({ response: "Sorry, I didn't understand the question." });
  }
});

// GET endpoint to fetch scraped data
app.get('/scrape', async (req, res) => {
  const scrapedData = await scrapeData();

  if (scrapedData) {
    res.json({ data: scrapedData });
  } 
  else {
    res.status(500).json({ error: "Failed to scrape data" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
