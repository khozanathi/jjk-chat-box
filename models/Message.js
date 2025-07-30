const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  username: String,
  text: String,
  file: String,
  timestamp: Date
});

module.exports = mongoose.model("Message", MessageSchema);