/**
 * @description
 * This module provides functions to scrape nursing program data from specified urls. 
 * It handles scraping HTML pages and extracting text from linked PDFs.
 * It uses axios for HTTP requests, cheerio for HTML parsing, and pdf-parse for PDF text extraction.
 * The scraper supports reading additional URLs from a text file, categorizing URLs by type,
 * and displays progress bars during scraping. It aggregates and returns the extracted data.
 * @version 1.0
 */
import axios from "axios";
import * as cheerio from "cheerio";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cliProgress from "cli-progress"; 

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/**
 * @function scrapeData
 * @description
 * Main function to scrape nursing data from the Green River College nursing program website.
 * It loads the main page, additional URLs from a text file, and scrapes both HTML pages and PDF documents.
 * It consolidates the extracted headings and text content into an object.
 * Includes console logs for progress and error handling.
 * 
 * @returns {Promise<Object|null>} An object containing the scraped nursing data keyed by headings, or null on failure.
 */
export async function scrapeData() {
  try {
    console.log("🚀 Starting nursing data scrape...");

    const baseUrl = "https://www.greenriver.edu";
    const mainPageUrl = `${baseUrl}/students/academics/degrees-programs/nursing/index.html`;

    // Read additional URLs from file
    const linksPath = path.join(__dirname, "db", "linksfornursing.txt");
    const allExtra = fs
      .readFileSync(linksPath, "utf-8")
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(href => new URL(href, baseUrl).href);

    // Categorize extras: PDF vs HTML
    const extraPdfUrls = allExtra.filter(u => u.toLowerCase().endsWith('.pdf'));
    const extraPageUrls = allExtra.filter(u => !u.toLowerCase().endsWith('.pdf'));

    // Fetch and parse main page
    const mainPageData = await fetchAndParsePage(mainPageUrl);

    // Extract subpage links from main page
    const { data: html } = await axios.get(mainPageUrl);
    const $ = cheerio.load(html);
    const subpageLinks = new Set(
      $("a[href^='/students/academics/degrees-programs/nursing/']").
        filter((_, el) => {
          const href = $(el).attr("href");
          return href && (href.endsWith(".html") || href.endsWith("/"));
        }).
        map((_, el) => new URL($(el).attr("href"), baseUrl).href).get()
    );

    // Combine all page URLs
    const pageUrls = [...subpageLinks, ...extraPageUrls];
    console.log(`📄 Found ${pageUrls.length} HTML pages to scrape.`);

    // Combine all PDF URLs from txt
    console.log(`📄 Found ${extraPdfUrls.length} extra PDF(s) to extract.`);

    // Progress bar for pages
    const pageBar = new cliProgress.SingleBar({
      format: "⏳ Pages |{bar}| {value}/{total}",
      barCompleteChar: "█",
      barIncompleteChar: "░",
      hideCursor: true,
    });
    pageBar.start(pageUrls.length, 0);

    // Aggregate data
    const nursingData = { ...mainPageData };

    // Scrape HTML pages
    for (let i = 0; i < pageUrls.length; i++) {
      const pageData = await fetchAndParsePage(pageUrls[i]);
      Object.assign(nursingData, pageData);
      pageBar.update(i + 1);
    }
    pageBar.stop();

    // Extract extra PDFs from txt file, regardless of domain
    for (const pdfUrl of extraPdfUrls) {
      console.log(`📄 Extra PDF: ${pdfUrl}`);
      const text = await extractPdfText(pdfUrl);
      if (text) {
        nursingData[`PDF: ${path.basename(pdfUrl)}`] = text;
      }
    }

    console.log("✅ Scraping complete.");
    console.log("🧠 Extracted headings:", Object.keys(nursingData));
    return { nursingData };
  } catch (err) {
    console.error("❌ Error scraping data:", err);
    return null;
  }
}

/**
 * @function fetchAndParsePage
 * @description
 * Fetches an HTML page at the given URL and extracts structured data.
 * Specifically, it extracts the page title and concatenates text content
 * under h2, h3, and h4 headings. The extracted data is keyed by
 * "Page Title - Heading".
 * 
 * @param {string} pageUrl - The full URL of the page to scrape.
 * @returns {Promise<Object>} A key-value object of extracted headings and content.
 */
async function fetchAndParsePage(pageUrl) {
  const result = {};
  try {
    console.log(`🌐 Scraping page: ${pageUrl}`);
    const { data: html } = await axios.get(pageUrl);
    const $ = cheerio.load(html);
    const title = $("title").text().trim() || "Untitled";

    // Extract HTML headings and following content
    $("h2, h3, h4").each((_, el) => {
      const heading = $(el).text().trim();
      let content = '';
      let sib = $(el).next();
      while (sib.length && !sib.is("h2, h3, h4")) {
        content += ` ${sib.text().trim()}`;
        sib = sib.next();
      }
      if (content.trim()) result[`${title} - ${heading}`] = content.trim();
    });

    console.log(`✅ Finished scraping: ${pageUrl}`);
  } catch (err) {
    console.error(`❌ Failed to parse page: ${pageUrl}`, err.message);
  }
  return result;
}

/**
 * @function extractPdfText
 * @description
 * Downloads a PDF file from the provided URL and extracts its text content.
 * Uses axios to fetch the PDF as an arraybuffer and pdf-parse to extract text.
 * 
 * @param {string} pdfUrl - The full URL of the PDF to download and parse.
 * @returns {Promise<string>} The extracted text content of the PDF or an empty string on failure.
 */
async function extractPdfText(pdfUrl) {
  try {
    console.log(`📄 Downloading PDF: ${pdfUrl}`);
    const res = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(res.data);
    const data = await pdfParse(buffer);
    console.log(`✅ PDF extracted: ${pdfUrl}`);
    return data.text.trim();
  } catch (err) {
    console.error(`❌ PDF extraction failed: ${pdfUrl}`, err.message);
    return '';
  }
}

// If run directly, execute scraper
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeData().catch(err => console.error(err));
}
