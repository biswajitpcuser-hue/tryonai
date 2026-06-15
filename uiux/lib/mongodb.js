import { MongoClient } from "mongodb";

let client;
let clientPromise;

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("MONGO_URI is not defined in .env.local");
}

client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
});

clientPromise = client.connect();

export async function connectToDatabase() {
  await clientPromise;
  const db = client.db(process.env.DB_NAME || "wingo_db");
  return { db, client };
}
