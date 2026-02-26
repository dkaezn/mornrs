import mongoose from "mongoose";

const MemorySchema = new mongoose.Schema({
  title: String,
  date: String,
  content: String,
  image: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Memory", MemorySchema);
