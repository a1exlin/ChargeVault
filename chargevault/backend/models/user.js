const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  token: String
}, { collection: 'users' });

module.exports = mongoose.model('User', userSchema);
