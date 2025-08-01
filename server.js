const express = require("express");
const http = require("http");
const path = require("path");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const multer = require("multer");
const Message = require("./models/Message"); // Message schema

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Routes
app.get("/api/messages", async (req, res) => {
  const messages = await Message.find().sort({ timestamp: 1 });
  res.json(messages);
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
  console.log("User connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start the server
const PORT = process.env.PORT || 7575;
server.listen(7575, () => console.log("Server running on http://localhost:7575"));