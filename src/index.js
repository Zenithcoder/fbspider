import env from 'env';
import fs from 'fs';
import puppeteer from 'puppeteer';
import * as Group from 'group';

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

  // Loggin
  const page = await browser.newPage();
  await page.goto('https://www.facebook.com', { waitUntil: 'networkidle' });
  await page.type('#email', env.email);
  await page.type('#pass', env.pass);
  await page.click('#loginbutton');
  await page.waitFor('#userNav', { timeout: 60e3 });

  console.log("-------------------------- Navigating ------------------------------");
  // Navigate to group
  await page.goto(groupURL, { waitUntil: 'networkidle' });
  console.log("---------------------- Navigate done -------------------------------");

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

    for (let i in postURLs) {
      const postURL = postURLs[i];
      console.log(" postURL = ", postURL)
      const postId = Group.getPostIdFromURL(postURL);

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
      fs.writeFileSync(`${datasetDir(appName)}/crawled-ids.json`, Array.from(donePosts).join(','));
    }
  }

});

try {
  app('vietnamesesexybae', 'https://www.facebook.com/groups/vietnamesesexybae/');
} catch(err) {
  console.error(err);
}
