import nano from 'nano';
import dotenv from 'dotenv';
dotenv.config();

const COUCHDB_URL = process.env.COUCHDB_URL;
const COUCHDB_DB_NAME = process.env.COUCHDB_DB_NAME;

const couch = nano(COUCHDB_URL);
const db = couch.db.use(COUCHDB_DB_NAME);

export const get = (email) => db.get(email);

export const insert = (doc) => db.insert(doc);
