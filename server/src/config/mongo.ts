import bcrypt from 'bcrypt';
import { Db, MongoClient } from 'mongodb';

const databaseName = process.env.MONGODB_DB || 'daily-bytes';
const mongoUri = process.env.MONGODB_URI;

let client: MongoClient | null = null;
let database: Db | null = null;

export interface DailyBytesUser {
  username: string;
  usernameNormalized: string;
  email: string;
  emailNormalized: string;
  passwordHash: string;
  createdAt: Date;
}

export interface DailyBytesSavedArticle {
  usernameNormalized: string;
  title: string;
  url: string;
  description: string;
  image: string;
  source: string;
  publishedAt: string;
  topic: string;
  savedAt: Date;
}

export const connectMongo = async () => {
  if (database) return database;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is required');
  }

  client = new MongoClient(mongoUri);
  await client.connect();
  database = client.db(databaseName);

  const users = database.collection<DailyBytesUser>('users');
  const savedArticles = database.collection<DailyBytesSavedArticle>('saved_articles');
  await Promise.all([
    users.createIndex({ usernameNormalized: 1 }, { unique: true }),
    users.createIndex({ emailNormalized: 1 }, { unique: true }),
    savedArticles.createIndex({ usernameNormalized: 1, url: 1 }, { unique: true }),
    savedArticles.createIndex({ usernameNormalized: 1, savedAt: -1 }),
  ]);

  const demoUsername = 'demo';
  const demoEmail = 'demo@dailybytes.local';
  const demoPassword = process.env.DEMO_PASSWORD || 'dailybytes';
  const existingDemo = await users.findOne({ usernameNormalized: demoUsername });

  if (!existingDemo) {
    await users.insertOne({
      username: demoUsername,
      usernameNormalized: demoUsername,
      email: demoEmail,
      emailNormalized: demoEmail,
      passwordHash: await bcrypt.hash(demoPassword, 12),
      createdAt: new Date(),
    });
  }

  return database;
};

export const getDb = () => {
  if (!database) {
    throw new Error('MongoDB has not been initialized');
  }

  return database;
};
