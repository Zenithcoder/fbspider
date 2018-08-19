import * as Firebase from 'firebase';

import Auth from 'auth';
import * as Setting from 'setting';

const firebase = Firebase.initializeApp(Auth.firebase);
const database = firebase.database();

export const app = async (appname) => {
  const datasetDir = Setting.datasetDir();

}
