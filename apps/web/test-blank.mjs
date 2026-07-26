import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
  page.on('pageerror', error => console.error('BROWSER_ERROR:', error.message));
  
  await page.goto('http://localhost:5175/profile', { waitUntil: 'networkidle0' });
  
  await browser.close();
})();
