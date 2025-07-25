const express = require("express");
const http = require("http");
const multer = require("multer");
const mongoose = require("mongoose");
const socketIO = require("socket.io");

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

server.listen(7575, () => console.log("Server running on http://localhost:7575"));