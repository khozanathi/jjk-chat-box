const express = require("express");
const http = require("http");
const multer = require("multer");
const mongoose = require("mongoose");
const socketIO = require("socket.io");
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

mongoose.connect("mongodb://localhost:27017/");

const MessageSchema = new mongoose.Schema({
  username: String,
  text: String,
  file: String,
  timestamp: Date
});
const Message = mongoose.model("Message", MessageSchema);

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

app.use(express.static("public"));

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

app.use('/uploads', express.static('uploads'));

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
    file
  });

  try {
    await newMessage.save();
    res.status(201).send('Message saved');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving message');
  }
});

server.listen(7575, () => console.log("Server running on http://localhost:7575"));