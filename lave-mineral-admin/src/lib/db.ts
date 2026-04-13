import mongoose from "mongoose";

// ✅ Ensure env exists
const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("❌ Please define MONGODB_URI in .env.local");
}

// ✅ Global cache type
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// ✅ Initialize cache safely
const globalCache =
  global.mongooseCache || {
    conn: null,
    promise: null,
  };

global.mongooseCache = globalCache;

// ✅ Connect DB (optimized & cached)
export async function connectDB() {
  // Already connected
  if (globalCache.conn) {
    return globalCache.conn;
  }

  // Create connection promise if not exists
  if (!globalCache.promise) {
    globalCache.promise = mongoose.connect(MONGODB_URI, {
      dbName: "Lave_Order",
      bufferCommands: false,
    });
  }

  try {
    globalCache.conn = await globalCache.promise;
  } catch (error) {
    globalCache.promise = null;
    throw error;
  }

  return globalCache.conn;
}