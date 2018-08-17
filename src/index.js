import env from 'env';
import fs from 'fs';
import path from 'path';
import moment from 'moment';
import puppeteer from 'puppeteer';

import * as Feed from 'feed';

/* Config dataset directories */
const DATA_PATH = path.resolve(__dirname, '../dataset');
const today = moment().format('YYYY-MM-DD');
const datasetDir = (app) => `${DATA_PATH}/${app}/${today}`;

/* Ensure dataset exists. If not, create it */
if (!fs.existsSync('dataset')) {
  fs.mkdirSync('dataset');
  console.log('Created dataset')
}

const app = (async (appName, groupURL) => {
  /* Ensure dataset exists for app */
    if (!fs.existsSync(`${DATA_PATH}/${appName}`)) {
      fs.mkdirSync(`${DATA_PATH}/${appName}`);
  }

  /* Init puppeteer browser and page */
  const browser = await puppeteer.launch({
    // headless: process.env.HEADLESS === 'true',
    headless: false,
    // devtools: false,
    timeout: 0,
    args: ['--no-sandbox']
  });

  // Loggin
  const page = await browser.newPage();
  await page.goto('https://www.facebook.com', { waitUntil: 'networkidle2' });
  await page.type('#email', env.email);
  await page.type('#pass', env.pass);
  await page.click('#loginbutton');
  await page.waitFor('#userNav', { timeout: 60e3 });

  // Navigate to group
  await page.goto(groupURL, { waitUntil: 'networkidle2' });

  // Prepare for crawler
  let crawledIds;
  let ignoredIds;

  try {
    crawledIds = fs.readFileSync(`${datasetDir(appName)}/crawled-ids.json`).toString().split(',');
  } catch (e) {
    crawledIds = [];
  }

  try {
    ignoredIds = fs.readFileSync(`${datasetDir(appName)}/ignored-ids.txt`).toString().split(',');
  } catch (e) {
    ignoredIds = [];
  }
  console.log("------------------------------ Prepared ------------------------");

  crawledIds = new Set(crawledIds);
  ignoredIds = new Set(ignoredIds);

  await Feed.all(page, crawledIds, ignoredIds, appName, browser);

  browser.close();
});

try {
  app('vietnamesesexybae', 'https://www.facebook.com/groups/VNsbGroup/');
  // app('redditvietnam', 'https://www.facebook.com/groups/redditvietnam/');
} catch(err) {
  console.error(err);
}
