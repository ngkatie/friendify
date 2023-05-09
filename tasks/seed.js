import fs from 'fs';
import JSONStream from 'JSONStream';
import { MongoClient, ObjectId } from 'mongodb';
import { dbConnection, closeConnection } from '../config/mongoConnection.js';

// Set up MongoDB connection URL and options
const url = 'mongodb://127.0.0.1:27017';
const dbName = 'friendify';
const collectionName = 'users';
const options = { useNewUrlParser: true, useUnifiedTopology: true };

const seedData = async () => {
  try {
    // Connect to MongoDB and drop the database
    const db = await dbConnection();
    await db.dropDatabase();

    // Read the JSON file using the 'JSONStream' library
    const results = [];
    fs.createReadStream('seedJSON.json')
      .pipe(JSONStream.parse('*'))
      .on('data', (data) => {
        if (typeof data._id === 'string') {
          data._id = new ObjectId(data._id);
        }
        data.lastUpdated = null; // set lastUpdated to null
        results.push(data);
      })
      .on('end', async () => {
        // Insert the JSON data into a collection
        const client = await MongoClient.connect(url, options);
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        for (const result of results) {
          await collection.insertOne(result);
        }
        console.log(`${results.length} documents inserted into ${collectionName}`);
        client.close();
        await closeConnection();
        console.log('DONE W SEEDING');
      });
  } catch (err) {
    console.error(err);
  }
}

seedData();
