import * as Group from 'group';
import fs from 'fs';
import path from 'path';
import moment from 'moment';

import * as Setting from 'setting';

export const all = async (page, appName, browser) => {
  const datasetDir = Setting.datasetDir();

  let count = 0;

  let crawledIds = Setting.getCrawledIds();
  let ignoredIds = Setting.getIgnoredIds();

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

      // if (!fs.existsSync(datasetDir(appName))) {
        // fs.mkdirSync(datasetDir(appName));
      // }

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
}
