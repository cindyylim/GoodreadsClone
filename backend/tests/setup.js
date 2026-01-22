import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

export const connect = async () => {
    mongoServer = await MongoMemoryServer.create({
        instance: {
            dbName: 'jest',
        },
        binary: {
            version: '6.0.4',
        }
    });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
};

export const closeDatabase = async () => {
    if (mongoServer) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    }
};

export const clearDatabase = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
};
