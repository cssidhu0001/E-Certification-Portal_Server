const puppeteer = require("puppeteer");

(async () => {
  try {
    console.log("Starting Chrome...");

    const browser = await puppeteer.launch({
      headless: true,
      timeout: 120000,
      protocolTimeout: 120000,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    console.log("Chrome started successfully!");

    const page = await browser.newPage();

    console.log("New page created!");

    await page.goto("https://example.com", {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });

    console.log("Page loaded!");

    await browser.close();

    console.log("DONE");
  } catch (error) {
    console.error("ERROR:");
    console.error(error);
  }
})();