import env from 'env';
import fs from 'fs';
import path from 'path';
import moment from 'moment';
import puppeteer from 'puppeteer';
import * as Group from 'group';

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
    headless: process.env.HEADLESS === 'true',
    // headless: false,
    devtools: false,
    timeout: 0,
    args: ['--no-sandbox']
  });

  // Loggin
  const page = await browser.newPage();
  await page.goto('https://www.facebook.com', { waitUntil: 'networkidle' });
  await page.type('#email', env.email);
  await page.type('#pass', env.pass);
  await page.click('#loginbutton');
  await page.waitFor('#userNav', { timeout: 60e3 });

  // Navigate to group
  await page.goto(groupURL, { waitUntil: 'networkidle' });

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

  let count = 0;
  while(true) {
    count++;
    console.log("---------------------- times: ", count, "----------------------");
    let postURLs = await Group.getPosts(page);
    console.log("---- postURLs = ", postURLs);

    postURLs = (await Group.getPosts(page))
      .filter((p, idx) => idx !== 0)
      .filter(p => p.indexOf('permalink') !== -1)
      .filter(p => !crawledIds.has(Group.getPostIdFromURL(p)))
      .filter(p => !ignoredIds.has(Group.getPostIdFromURL(p)));

     if (!postURLs.length) {
      await Group.nextPage(page);
     }

    for (let i in postURLs) {
      const postURL = postURLs[i];
      console.log(" postURL = ", postURL)
      const postId = Group.getPostIdFromURL(postURL);

      if (!fs.existsSync(datasetDir(appName))) {
        fs.mkdirSync(datasetDir(appName));
      }

      // Crawl a post to json file
      let postPage = await browser.newPage();
      const meta = await Group.getPostMeta(postPage, postURL);
      const post = {
        ...meta
      }

      fs.writeFileSync(`${datasetDir(appName)}/${postId}.json`, JSON.stringify(post));
      await postPage.close();

      // Save history
      crawledIds.add(postId);
      fs.writeFileSync(`${datasetDir(appName)}/crawled-ids.json`, Array.from(crawledIds).join(','));
    }
  }

  browser.close();

});

try {
  app('vietnamesesexybae', 'https://www.facebook.com/groups/VNsbGroup/');
} catch(err) {
  console.error(err);
}
