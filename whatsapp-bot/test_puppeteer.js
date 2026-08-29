const puppeteer = require('puppeteer');
(async () => {
  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('Browser launched!');
    const page = await browser.newPage();
    console.log('Page created!');
    await page.goto('https://google.com');
    console.log('Navigated to Google!');
    await browser.close();
    console.log('Browser closed. Puppeteer is working fine.');
  } catch (e) {
    console.error('Puppeteer Test Failed:', e);
  }
})();
