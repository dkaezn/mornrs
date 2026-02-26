import express from "express";
import multer from "multer";
import Memory from "../models/Memory.js";

const router = express.Router();

// Image upload settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

// POST memory
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const memory = new Memory({
      title: req.body.title,
      date: req.body.date,
      content: req.body.content,
      image: req.file ? req.file.filename : null
    });

    await memory.save();
    res.json({ success: true, memory });
  } catch (err) {
    res.status(500).json({ error: "Failed to save memory" });
  }
});

// GET memories
router.get("/", async (req, res) => {
  const memories = await Memory.find().sort({ createdAt: -1 });
  res.json(memories);
});

export default router;
