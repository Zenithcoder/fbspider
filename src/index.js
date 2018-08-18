import env from 'env';
import puppeteer from 'puppeteer';

import * as Feed from 'feed';
import * as Setting from 'setting';

const app = (async (appName, groupURL) => {
  /* Init puppeteer browser and page */
  const browser = await puppeteer.launch({
    // headless: process.env.HEADLESS === 'true',
    headless: false,
    // devtools: false,
    timeout: 0,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await login(page, groupURL);

  await Setting.initialize();

  await Feed.all(page, appName, browser);

  browser.close();
});

const login = async (page, groupURL) => {
  await page.goto('https://www.facebook.com', { waitUntil: 'networkidle2' });
  await page.type('#email', env.email);
  await page.type('#pass', env.pass);
  await page.click('#loginbutton');
  await page.waitFor('#userNav', { timeout: 60e3 });

  // Navigate to group
  await page.goto(groupURL, { waitUntil: 'networkidle2' });
}

try {
  app('vietnamesesexybae', 'https://www.facebook.com/groups/VNsbGroup/');
  // app('redditvietnam', 'https://www.facebook.com/groups/redditvietnam/');
} catch(err) {
  console.error(err);
}
