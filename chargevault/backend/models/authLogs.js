const LoginLogSchema = new mongoose.Schema({
    username: String,
    loginTime: String,
    ip: String,
    userAgent: String,
  }, { collection: 'authLogs' });
  
  module.exports = mongoose.model('User', userSchema);
  