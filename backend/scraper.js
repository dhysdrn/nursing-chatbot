import axios from "axios";
import * as cheerio from "cheerio";

const fetchAndParsePage = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const pageTitle = $("title").text();
    const nursingData = {};

    $("h2, h3").each((index, element) => {
      const headingText = $(element).text().trim();
      let content = "";

      let nextElement = $(element).next();
      while (nextElement.length && !nextElement.is("h2, h3")) {
        const tag = nextElement.prop("tagName").toLowerCase();
        if (tag === "p") {
          content += "\n" + nextElement.text().trim() + "\n";
        } else if (tag === "ul" || tag === "ol") {
          nextElement.find("li").each((j, li) => {
            content += "- " + $(li).text().trim() + "\n";
          });
        } else if (tag === "div" || tag === "span") {
          content += "\n" + nextElement.text().trim() + "\n";
        } else {
          content += nextElement.text().trim() + " ";
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
    console.error(`Error scraping ${url}:`, error.message);
    return {};
  }
};

export const scrapeData = async () => {
  try {
    const { data } = await axios.get(
      "https://www.greenriver.edu/students/academics/degrees-programs/nursing/index.html"
    );
    const $ = cheerio.load(data);
    const mainPageData = await fetchAndParsePage(
      "https://www.greenriver.edu/students/academics/degrees-programs/nursing/index.html"
    );

    const linksToFollow = $(
      "a[href^='/students/academics/degrees-programs/nursing/']"
    )
      .filter(
        (i, el) =>
          $(el).attr("href").endsWith(".html") ||
          $(el).attr("href").endsWith("/")
      )
      .map((i, el) => `https://www.greenriver.edu${$(el).attr("href")}`)
      .get();

    const subPageData = await Promise.all(
      linksToFollow.map((link) => fetchAndParsePage(link))
    );

    const nursingData = { ...mainPageData };
    subPageData.forEach((pageData) => {
      Object.assign(nursingData, pageData);
    });

    console.log(
      "✅ Scraped Nursing Data:",
      JSON.stringify(nursingData, null, 2)
    );
    return { nursingData };
  } catch (error) {
    console.error("❌ Error scraping data:", error.message);
    return null;
  }
};
