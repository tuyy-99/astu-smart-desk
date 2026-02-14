import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not set.");
  }

  const conn = await mongoose.connect(mongoUri);
  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

  mongoose.connection.on("error", (err: Error) => {
    console.error("MongoDB connection error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });
};

export default connectDB;
