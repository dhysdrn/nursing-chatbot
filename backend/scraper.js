const axios = require('axios');
const cheerio = require('cheerio');

const scrapeData = async () => {
  try {
    const { data } = await axios.get('https://www.greenriver.edu/students/academics/degrees-programs/nursing/index.html'); 
    const $ = cheerio.load(data);

    let admissionsInfo = [];

    $('h2, h3, p').each((index, element) => {
      const text = $(element).text().trim();
      if (text.toLowerCase().includes('admission')) {
        admissionsInfo.push(text);
      }
    });

    console.log('✅ Scraped Admissions Info:', admissionsInfo);

    return { admissionsInfo };
  } catch (error) {
    console.error('❌ Error scraping data:', error.message);
    return null;
  }
};

module.exports = scrapeData;
