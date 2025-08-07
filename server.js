const express = require("express");
const http = require("http");
const path = require("path");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const multer = require("multer");
const fs = require("fs");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./config/cloudinary");
const Message = require("./models/Message"); // Your MongoDB model

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "chatbox_uploads",
    allowed_formats: ["jpg", "png", "pdf", "mp4", "mp3", "webm", "wav"],
    public_id: (req, file) => `${Date.now()}-${file.originalname.replace(/[\s()]/g, "_")}`
  }
});

const upload = multer({ storage });

router.post("/api/messages", upload.single("file"), async (req, res) => {
  const { username, text } = req.body;
  const fileUrl = req.file ? req.file.path : null; // Cloudinary returns a public URL

  const message = new Message({
    username,
    text,
    file: fileUrl,
    timestamp: new Date()
  });

  await message.save();
  req.app.get("io").emit("chat", message); // Emit via Socket.IO
  res.status(201).json(message);
});
/////////////////////////////////////
/*
app.post('/uploads', upload.single('file'), (req, res) => {
  console.log(req.file);
  res.send('File uploaded');
});*/

app.use(express.static("public"));

// Fetch chat history from DB
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 }).exec(); // Fetch messages sorted by timestamp
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching messages');
  }
});

app.post("/api/messages", upload.single("file"), async (req, res) => {
  const { username, text } = req.body;
  const file = req.file ? req.file.filename : null;

  const message = new Message({ username, text, file, timestamp: new Date() });
  await message.save();

  io.emit("chat", message);
  res.status(201).json(message);
});

// Socket.IO connection
io.on("connection", socket => {
  socket.on("chat", async ({ username, text, file }) => {
    const msg = new Message({
      username,
      text,
      file,
      timestamp: new Date()
    });
    await msg.save();
    io.emit("chat", msg);
  });
});

// Start the server
const PORT = process.env.PORT || 7575;
server.listen(7575, () => console.log("Server running on http://localhost:7575"));
