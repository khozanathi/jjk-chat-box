const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  username: String,
  sender: String,
  receiver: String,
  text: String,
  file: String,
  timestamp: { type: Date, default: Date.now }
});

// Prevent OverwriteModelError
module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema);