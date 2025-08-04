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
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

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

app.post('/api/messages', async (req, res) => {
  const { username, text, file } = req.body;
  const newMessage = new Message({
    username,
    text,
    file: req.file ? req.file.filename : null,
    timestamp: new Date()
  });

  try {
    await newMessage.save();
    res.status(201).send('Message saved');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving message');
  }
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
