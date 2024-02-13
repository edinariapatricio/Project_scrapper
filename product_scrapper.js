"use strict";
/**
 * Required External Modules
 */

const getHTML = require("html-get");
const fs = require("fs").promises;
// read enviroment variables from .env
const dotenv = require("dotenv");
dotenv.config();

/**
 * `browserless` will be passed to `html-get`
 * as driver for getting the rendered HTML.
 */
const createBrowserless = require("browserless");
const Sitemapper = require("sitemapper");
/**
 * `metascraper` is a collection of tiny packages,
 * so you can just use what you actually need.
 */
const metascraper = require("metascraper")([
  require("@samirrayani/metascraper-shopping")(),
  require("metascraper-author")(),
  require("metascraper-date")(),
  require("metascraper-description")(),
  require("metascraper-image")(),
  require("metascraper-logo")(),
  require("metascraper-clearbit")(),
  require("metascraper-publisher")(),
  require("metascraper-title")(),
  require("metascraper-url")(),
]);

// Kill the process when Node.js exit
process.on("exit", () => {
  console.log("closing resources!");
  browserless.close();
});

/**
 * App Variables
 */
const browserless = createBrowserless();
const sitemap = new Sitemapper();
const url = process.env.URL;
const urlObject = new URL(url);
const hostName = urlObject.hostname;
const protocol = urlObject.protocol;
const sitesFile = `./data/${hostName}-sites.json`;
const dataFile = `./data/${hostName}-data.json`;
const productPath = `${protocol}//${hostName}/products/`;

if (!url) {
  console.error("Set url variables");
  process.exit(1);
}

sitemap.timeout = 5000;

const getSitemap = async (url) => {
  const sites = await sitemap
    .fetch(url)
    .then(({ sites }) => {
      return sites;
    })
    .catch((error) => {
      throw error;
    });
  return sites;
};

const getContent = async (urls) => {
  // create a browser context inside the main Chromium process
  const browserContext = browserless.createContext();
  const getBrowserless = () => browserContext;
  var results = await Promise.all(
    urls.map(async (url) => {
      return await getHTML(url, { getBrowserless: () => browserContext });
    })
  );
  // close browser resources before return the result
  await getBrowserless((browser) => browser.destroyContext());
  return results;
};

const writeFile = async (filePath, data) => {
  try {
    let dataJSON = JSON.stringify(data, null, 2);
    const newData = await fs.writeFile(filePath, dataJSON);
    return newData;
  } catch (err) {
    console.log(err);
  }
};

/**
 * The main logic
 */
const scrapeWebsite = async () => {
  console.time("Execution");
  try {
    const pages = await getSitemap(url);
    // get only product pages
    const productPages = pages.filter((page) => page.startsWith(productPath));

    //  write product pages to file
    await writeFile(sitesFile, productPages);

    console.log("Total Products Pages: ", productPages.length);

    const htmls = [];
    const testOnly = 100000;
    const n = testOnly || productPages.length;
    const increment = testOnly || 100;
    for (let i = 0; i < n; i += increment) {
      const htmlsTmp = await getContent(productPages.slice(i, i + increment));
      htmls.push(...htmlsTmp);
    }

    //  Scrap data from html pages using metascraper
    const results = await Promise.all(
      htmls.map(async (html) => {
        const metadata = await metascraper(html);
        return metadata;
      })
    );

    //  write aggregated data to file
    await writeFile(dataFile, results);

    console.timeEnd("Execution");
    console.log(`Sites written to ${sitesFile}`);
    console.log(`Data written to ${dataFile}`);
    //console.log(results);
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
};
scrapeWebsite();
