import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error("MONGO_URI not defined in .env file");
    }

    console.log("🔗 Connecting to MongoDB Atlas...");
    console.log(`📍 Database: carDriver-1`);
    console.log(`👤 User: nakullagad084_db_user`);

    const conn = await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 44000,
      retryWrites: true,
      w: "majority"
    });

    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`🌍 Server: ${conn.connection.host}`);
    console.log(`📊 Database: carDriver-1`);
    
    return conn;
  } catch (error) {
    console.error(`\n❌ MongoDB Connection Failed:`);
    console.error(`   Error: ${error.message}`);
    console.error(`   Status: Connection refused or credentials invalid\n`);

    // Allow server to continue with warning
    console.warn(`⚠️  Server starting in MOCK MODE (no database)`);
    console.warn(`⚠️  Please fix MongoDB connection and restart\n`);
    
    return null;
  }
};

export default connectDB;