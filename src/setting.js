import * as Group from 'group';
import fs from 'fs';
import path from 'path';
import moment from 'moment';

/* Config dataset directories */
const DATA_PATH = path.resolve(__dirname, '../dataset');
const today = moment().format('YYYY-MM-DD');
const datasetDir = (app) => `${DATA_PATH}/${app}/${today}`;

export const initialize = async (appName) => {

  /* Ensure dataset exists. If not, create it */
  if (!fs.existsSync('dataset')) {
    fs.mkdirSync('dataset');
    console.log('Created dataset')
  }

  /* Ensure dataset exists for app */
    if (!fs.existsSync(`${DATA_PATH}/${appName}`)) {
      fs.mkdirSync(`${DATA_PATH}/${appName}`);
  }
}

export const getCrawledIds = () => {
  let crawledIds;

  try {
    crawledIds = fs.readFileSync(`${datasetDir(appName)}/crawled-ids.json`).toString().split(',');
  } catch (e) {
    crawledIds = [];
  }

  return new Set(crawledIds);
}

export const getIgnoredIds = () => {
  let ignoredIds;

  try {
    ignoredIds = fs.readFileSync(`${datasetDir(appName)}/ignored-ids.txt`).toString().split(',');
  } catch (e) {
    ignoredIds = [];
  }

  return new Set(ignoredIds);
}
