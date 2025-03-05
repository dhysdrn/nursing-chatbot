const express = require('express');
const cors = require('cors');
const scrapeData = require('./scraper');

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

app.post('/ask', async (req, res) => {
  const userQuestion = req.body.question.toLowerCase();

  if (userQuestion.includes('admissions')) {
    const scrapedData = await scrapeData();

    if (scrapedData && scrapedData.admissionsInfo.length > 0) {
      res.json({ response: scrapedData.admissionsInfo.join(" ") }); // Send as a string
    } else {
      res.json({ response: "Sorry, I couldn't find any admissions info." });
    }
  } else {
    res.json({ response: "Sorry, I didn't understand the question." });
  }
});

app.get('/scrape', async (req, res) => {
  const scrapedData = await scrapeData();
  if (scrapedData) {
    res.json({ data: scrapedData });
  } else {
    res.status(500).json({ error: "Failed to scrape data" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
