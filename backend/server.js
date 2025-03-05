import express from 'express';
import cors from 'cors';
import { scrapeData } from './scraper.js';
import { translate } from './nlpTranslator.js';

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
    const response = await translate(userQuestion);
    if (response != undefined) {
      res.json({ response: `${response}`});
    } else {
      res.json({ response: "Sorry, I didn't understand the question." });
    }
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