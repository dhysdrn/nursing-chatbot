import axios from "axios";
import * as cheerio from "cheerio";

/**
 * Fetches and parses a webpage to extract nursing-related data.
 * @param {string} url - The URL of the page to scrape.
 * @returns {Promise<Object>} An object containing extracted headings and their associated content.
 */
const fetchAndParsePage = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const pageTitle = $("title").text().trim() || "Unknown Page";
    const nursingData = {};

    $("h2, h3, h4").each((index, element) => {
      const headingText = $(element).text().trim();
      let content = "";

      let nextElement = $(element).next();
      while (nextElement.length && !nextElement.is("h2, h3, h4")) {
        const tag = nextElement.prop("tagName").toLowerCase();

        const processLinks = (el) => {
          const clone = el.clone();
          clone.find("a").each((i, a) => {
            const href = $(a).attr("href");
            const text = $(a).text().trim();
            if (href) {
              $(a).replaceWith(`[${text}](${href})`);
            }
          });
          return clone.text().trim();
        };

        if (tag === "p") {
          content += "\n" + processLinks(nextElement) + "\n";
        } else if (tag === "ul" || tag === "ol") {
          nextElement.find("li").each((j, li) => {
            content += "- " + processLinks($(li)) + "\n";
          });
        } else if (tag === "div" || tag === "span") {
          content += "\n" + processLinks(nextElement) + "\n";
        } else {
          content += processLinks(nextElement) + " ";
        }

        nextElement = nextElement.next();
      }

      if (content.trim()) {
        const fullHeading = `${pageTitle} - ${headingText}`;
        nursingData[fullHeading] = content.trim();
      }
    });

    return nursingData;
  } catch (error) {
    console.error(`❌ Error scraping ${url}:`, error.message);
    return {};
  }
};

/**
 * Scrapes data from the Green River College nursing program webpages.
 * @returns {Promise<Object|null>} An object containing scraped nursing data, or null if an error occurs.
 */
export const scrapeData = async () => {
  try {
    const baseUrl = "https://www.greenriver.edu";
    const mainUrl = `${baseUrl}/students/academics/degrees-programs/nursing/index.html`;
    const additionalUrls = [
      `${baseUrl}/students/academics/degrees-programs/nursing/bsn/bsnfaqs.html`,
      `${baseUrl}/students/academics/degrees-programs/nursing/practical-nursing/application/faqs.html`,
    ];

    const { data } = await axios.get(mainUrl);
    const $ = cheerio.load(data);
    const mainPageData = await fetchAndParsePage(mainUrl);

    const subpageLinks = $(
      "a[href^='/students/academics/degrees-programs/nursing/']"
    )
      .filter(
        (i, el) =>
          $(el).attr("href").endsWith(".html") ||
          $(el).attr("href").endsWith("/")
      )
      .map((i, el) => {
        const href = $(el).attr("href");
        return href.startsWith("http") ? href : `${baseUrl}${href}`;
      })
      .get()
      .filter((link, index, self) => self.indexOf(link) === index);

    const allUrls = [...new Set([...subpageLinks, ...additionalUrls])];
    const subPageData = await Promise.all(
      allUrls.map((link) => fetchAndParsePage(link))
    );

    const nursingData = { ...mainPageData };
    subPageData.forEach((pageData) => Object.assign(nursingData, pageData));

    console.log(
      "✅ Available headings in nursingDataCache:",
      Object.keys(nursingData)
    );
    console.log("✅ Nursing data cache refreshed");
    return { nursingData };
  } catch (error) {
    console.error("❌ Error scraping data:", error.message);
    return null;
  }
};
