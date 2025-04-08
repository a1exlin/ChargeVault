const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
}, { collection: 'logs' }); // <-- This is key

module.exports = mongoose.model('User', userSchema);
