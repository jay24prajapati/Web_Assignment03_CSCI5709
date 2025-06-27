import { MongoClient, Db } from 'mongodb';

export async function connectDB(): Promise<Db> {
  try {
    const client = await MongoClient.connect(process.env.MONGO_URI as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    } as any);
    console.log('MongoDB Connected');
    return client.db('dinebook');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    throw err;
  }
}