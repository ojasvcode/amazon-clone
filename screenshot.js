const puppeteer = require('puppeteer');
const path = require('path');

const OUT = '/Users/ojasvmathur/.gemini/antigravity/brain/7f437dff-96fb-454e-8007-e0c9339dd5b5';

async function screenshot(browser, url, name, delay = 2000) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, delay));
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
  await page.close();
  console.log(`✅ ${name}.png saved`);
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  await screenshot(browser, 'http://localhost:3000', 'home', 3000);
  await screenshot(browser, 'http://localhost:3000/login', 'login', 1500);
  await screenshot(browser, 'http://localhost:3000/search', 'search', 3000);
  await screenshot(browser, 'http://localhost:3000/cart', 'cart', 1500);
  await browser.close();
  console.log('Done!');
})();
