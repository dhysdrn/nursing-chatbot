// import axios from "axios";
// import * as cheerio from "cheerio";

// /**
//  * Fetches and parses a webpage to extract nursing-related data.
//  * @param {string} url - The URL of the page to scrape.
//  * @returns {Promise<Object>} An object containing extracted headings and their associated content.
//  */
// const fetchAndParsePage = async (url) => {
//   try {
//     const { data } = await axios.get(url);
//     const $ = cheerio.load(data);
//     const pageTitle = $("title").text().trim() || "Unknown Page";
//     const nursingData = {};

//     $("h2, h3, h4").each((index, element) => {
//       const headingText = $(element).text().trim();
//       let content = "";

//       let nextElement = $(element).next();
//       while (nextElement.length && !nextElement.is("h2, h3, h4")) {
//         const tag = nextElement.prop("tagName").toLowerCase();

//         const processLinks = (el) => {
//           const clone = el.clone();
//           clone.find("a").each((i, a) => {
//             const href = $(a).attr("href");
//             const text = $(a).text().trim();
//             if (href) {
//               const absoluteHref = new URL(href, "https://www.greenriver.edu").href;
//               $(a).replaceWith(`[${absoluteHref}][${text}]`);
//             }
//           });
//           return clone.text().trim();
//         };

//         if (tag === "p") {
//           content += "\n" + processLinks(nextElement) + "\n";
//         } else if (tag === "ul" || tag === "ol") {
//           nextElement.find("li").each((j, li) => {
//             content += "- " + processLinks($(li)) + "\n";
//           });
//         } else if (tag === "div" || tag === "span") {
//           content += "\n" + processLinks(nextElement) + "\n";
//         } else {
//           content += processLinks(nextElement) + " ";
//         }

//         nextElement = nextElement.next();
//       }

//       if (content.trim()) {
//         const fullHeading = `${pageTitle} - ${headingText}`;
//         nursingData[fullHeading] = content.trim();
//       }
//     });

//     return nursingData;
//   } catch (error) {
//     console.error(`❌ Error scraping ${url}:`, error.message);
//     return {};
//   }
// };

// /**
//  * Scrapes data from the Green River College nursing program webpages.
//  * @returns {Promise<Object|null>} An object containing scraped nursing data, or null if an error occurs.
//  */
// export const scrapeData = async () => {
//   try {
//     const baseUrl = "https://www.greenriver.edu";
//     const mainUrl = `${baseUrl}/students/academics/degrees-programs/nursing/index.html`;
//     const additionalUrls = [
//       `${baseUrl}/students/academics/degrees-programs/nursing/bsn/bsnfaqs.html`,
//       `${baseUrl}/students/academics/degrees-programs/nursing/practical-nursing/application/faqs.html`,
//     ];

//     const { data } = await axios.get(mainUrl);
//     const $ = cheerio.load(data);
//     const mainPageData = await fetchAndParsePage(mainUrl);

//     const subpageLinks = $(
//       "a[href^='/students/academics/degrees-programs/nursing/']"
//     )
//       .filter(
//         (i, el) =>
//           $(el).attr("href").endsWith(".html") ||
//           $(el).attr("href").endsWith("/")
//       )
//       .map((i, el) => {
//         const href = $(el).attr("href");
//         return href.startsWith("http") ? href : `${baseUrl}${href}`;
//       })
//       .get()
//       .filter((link, index, self) => self.indexOf(link) === index);

//     const allUrls = [...new Set([...subpageLinks, ...additionalUrls])];
//     const subPageData = await Promise.all(
//       allUrls.map((link) => fetchAndParsePage(link))
//     );

//     const nursingData = { ...mainPageData };
//     subPageData.forEach((pageData) => Object.assign(nursingData, pageData));

//     console.log(
//       "✅ Available headings in nursingDataCache:",
//       Object.keys(nursingData)
//     );
//     console.log("✅ Nursing data cache refreshed");
//     return { nursingData };
//   } catch (error) {
//     console.error("❌ Error scraping data:", error.message);
//     return null;
//   }
// };


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

// Only scrape PDFs hosted on Green River's domain
const ALLOWED_PDF_HOST = "greenriver.edu";

/**
 * Main function to scrape nursing data (handles both HTML pages and PDF URLs).
 * @returns {Promise<Object|null>} Scraped data or null on failure.
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
 * Fetches a page, extracts headings, text, and PDFs linked within.
 * Only processes PDFs hosted on the allowed domain.
 * @param {string} pageUrl
 * @returns {Promise<Object>} Extracted key-value pairs.
 */
async function fetchAndParsePage(pageUrl) {
  const result = {};
  try {
    console.log(`🌐 Scraping page: ${pageUrl}`);
    const { data: html } = await axios.get(pageUrl);
    const $ = cheerio.load(html);
    const title = $("title").text().trim() || "Untitled";

    // // Handle embedded PDF links on this page (broken!!! does not check if the pdf has already been downloaded)
    // for (const el of $("a[href$='.pdf']").toArray()) {
    //   const href = $(el).attr("href");
    //   if (!href) continue;
    //   const pdfUrl = new URL(href, pageUrl).href;
    //   // Skip PDFs not on the allowed host
    //   if (!new URL(pdfUrl).hostname.includes(ALLOWED_PDF_HOST)) {
    //     console.log(`🚫 Skipping external PDF: ${pdfUrl}`);
    //     continue;
    //   }
    //   const textLabel = $(el).text().trim() || path.basename(href);
    //   const pdfText = await extractPdfText(pdfUrl);
    //   if (pdfText) result[`${title} - PDF: ${textLabel}`] = pdfText;
    // }

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
 * Downloads and extracts text from a PDF URL.
 * @param {string} pdfUrl
 * @returns {Promise<string>} Extracted text or empty string.
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
