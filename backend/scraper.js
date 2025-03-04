const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const scrapeData = async () => {
  try {
    const { data } = await axios.get('https://www.greenriver.edu/students/academics/degrees-programs/nursing/index.html'); 
    const $ = cheerio.load(data);

    let results = [];
    $('h2, h3, p, a').each((index, element) => {
      if ($(element).is('a')) {
        results.push({ text: $(element).text().trim(), link: $(element).attr('href') });
      } else {
        results.push({ text: $(element).text().trim() });
      }
    });

    console.log('✅ Scraped Data:', results); // Log data to check if scraping works

    // Save to JSON file
    fs.writeFileSync('scrapedData.json', JSON.stringify(results, null, 2));

    return results;
  } catch (error) {
    console.error('❌ Error scraping data:', error.message);
    return null;
  }
};

// Run immediately to test scraping
scrapeData();
