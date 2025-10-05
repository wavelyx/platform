import { MongoClient } from "mongodb";
const MONGODB_URI = process.env.MONGODB_URI

let client: MongoClient | null = null

export const connectMongoose = async () => {
    if (client){
        return client
    };
    if(!MONGODB_URI){
        throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
    }

    try{
        client = new MongoClient(MONGODB_URI);
        await client.connect()
        return client
    }catch(err){
        console.error('MongoDB connection error:', err)
        throw err
    }
    
};
