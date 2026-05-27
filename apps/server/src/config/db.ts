import { MongoClient, Db } from 'mongodb';
import logger from '../utils/logger';

let client: MongoClient;
let db: Db;

export async function connectDB(): Promise<Db> {
  if (db) return db;

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/veda-ai';

  client = new MongoClient(uri, {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  await client.connect();
  db = client.db();
  logger.info(`MongoDB connected: ${uri}`);
  return db;
}

export function getDB(): Db {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
}

export async function closeDB(): Promise<void> {
  if (client) {
    await client.close();
    logger.info('MongoDB connection closed');
  }
}
