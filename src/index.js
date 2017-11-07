import puppeteer from 'puppeteer';
import fs from 'fs';
import env from 'env';

/* Ensure dataset exists. If not, create it */
if (!fs.existsSync('dataset')) {
  fs.mkdirSync('dataset');
  console.log('Created dataset')
}

const app = (async (appName, groupURL) => {
  /* Init puppeteer browser and page */
  const browser = await puppeteer.launch({
    headless: process.env.HEADLESS === 'true',
    // headless: false,
    devtools: false,
    timeout: 0,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://www.facebook.com', { waitUntil: 'networkidle' });
  await page.type('#email', env.email);
  await page.type('#pass', env.pass);
  await page.click('#loginbutton');
  await page.waitFor('#userNav', { timeout: 60e3 });

});

try {
  app('vietnamesesexybae', 'https://www.facebook.com/groups/vietnamesesexybae/');
} catch(err) {
  console.error(err);
}
