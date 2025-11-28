import mongoose from 'mongoose';

// Cache the database connection
let cachedConnection = null;

export const connectDB = async () => {
  // If we already have a connection, reuse it
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using cached MongoDB connection');
    return cachedConnection;
  }

  try {
    let uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/goodreads-clone';

    // If it's a local MongoDB connection, remove the query parameters
    if (uri.includes('localhost') || uri.includes('127.0.0.1')) {
      uri = uri.split('?')[0]; // Remove query parameters for local MongoDB
    }

    console.log('Creating new MongoDB connection...');
    const conn = await mongoose.connect(uri, {
      // Connection pool settings
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    cachedConnection = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    // Don't exit the process, let it retry on next request
    cachedConnection = null;
    throw error;
  }
};
