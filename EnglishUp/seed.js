// seed.js - insert admin user and sample words
const { MongoClient, ObjectId } = require('mongodb');
const { randomBytes, createHmac } = require('crypto');
const { SECRETKEY } = require('./config');

const uri = 'mongodb://localhost:27017';
const dbName = 'EnglishUp';

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(dbName);

    // Seed admin user
    const users = db.collection('users');
    const adminUser = await users.findOne({ username: 'admin' });
    if (!adminUser) {
      const salt = randomBytes(16).toString('hex');
      const password = 'admin123';
      const hpass = createHmac('sha256', salt).update(password).digest('hex');
      await users.insertOne({ username: 'admin', fullname: 'Administrator', role: 'admin', salt, hpass });
      console.log('Inserted admin user: admin / admin123');
    } else {
      console.log('Admin user already exists');
    }

    // Seed some words
    const words = db.collection('words');
    const sample = [
      { english: 'apple', vietnamese: 'táo', type: 'noun', pronunciation: 'ˈæpəl', example: 'I eat an apple.' },
      { english: 'run', vietnamese: 'chạy', type: 'verb', pronunciation: 'rʌn', example: 'I run every morning.' },
      { english: 'beautiful', vietnamese: 'đẹp', type: 'adjective', pronunciation: 'ˈbjuːtɪfəl', example: 'The sunset is beautiful.' },
      { english: 'book', vietnamese: 'sách', type: 'noun', pronunciation: 'bʊk', example: 'This book is interesting.' },
      { english: 'learn', vietnamese: 'học', type: 'verb', pronunciation: 'lɜːrn', example: 'I learn English.' }
    ];

    for (const w of sample) {
      const exists = await words.findOne({ english: w.english });
      if (!exists) {
        await words.insertOne({ ...w, createdAt: new Date() });
        console.log('Inserted word:', w.english);
      } else {
        console.log('Word exists:', w.english);
      }
    }

    console.log('Seeding complete');
  } catch (err) {
    console.error('Seed error', err);
  } finally {
    await client.close();
  }
}

run();
