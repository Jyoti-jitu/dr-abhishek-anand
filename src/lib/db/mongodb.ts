import { MongoClient, Db } from "mongodb";

const DEFAULT_URI = "mongodb+srv://parhijyotiswarup_db_user:JxHPTM5oQxjg9qJ9@chat.njrcbvy.mongodb.net/dr_anand_clinic?appName=Chat";
const DEFAULT_DB = "dr_anand_clinic";

const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_URI;
const MONGODB_DB = process.env.MONGODB_DB || DEFAULT_DB;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // Preserve client across HMR in development
  if (!global._mongoClientPromise) {
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });
  clientPromise = client.connect();
}

export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(MONGODB_DB);
}
