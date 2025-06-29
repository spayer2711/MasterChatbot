// utils/db.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db;

async function connectToMongo() {
  if (!db) {
    await client.connect();
    db = client.db('webscraper');
  }
  return db;
}

module.exports = connectToMongo;
