import axios from "axios";
import * as cheerio from "cheerio";

export const scrapeData = async () => {
  try {
    const { data } = await axios.get(
      "https://www.greenriver.edu/students/academics/degrees-programs/nursing/index.html"
    );
    const $ = cheerio.load(data);
    const nursingData = {};

    $("h2, h3").each((index, element) => {
      const headingText = $(element).text().trim();
      let content = "";

      // Collect all following siblings until the next h2/h3, including nested content
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
        nursingData[headingText] = content.trim();
      }
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
