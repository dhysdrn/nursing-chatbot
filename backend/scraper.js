export const scrapeData = async () => {
  try {
    const baseUrl = "https://www.greenriver.edu";
    const mainUrl = `${baseUrl}/students/academics/degrees-programs/nursing/index.html`;
    const additionalUrls = [
      "https://www.greenriver.edu/students/academics/degrees-programs/nursing/bsn/bsnfaqs.html",
      "https://www.greenriver.edu/students/academics/degrees-programs/nursing/practical-nursing/application/faqs.html",
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

    console.log("✅ Scraped Headings:", Object.keys(nursingData));
    return { nursingData };
  } catch (error) {
    console.error("❌ Error scraping data:", error.message);
    return null;
  }
};
