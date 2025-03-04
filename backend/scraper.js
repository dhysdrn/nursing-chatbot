// TODO: Assigned to Lois
const axios = require('axios');
const cheerio = require('cheerio');

const scrapeData = async () => {
  try {
    const { data } = await axios.get('https://www.example.com/nursing-program'); 
    const $ = cheerio.load(data);

    // Extract data from the page
    const programInfo = $('div.program-details').text(); 
    const admissionsInfo = $('section.admissions').text(); 

    return { programInfo, admissionsInfo };
  } catch (error) {
    console.error('Error scraping data:', error);
    return null;
  }
};

module.exports = scrapeData;