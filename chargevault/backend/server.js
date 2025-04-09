const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();
const User =require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Express app and middleware
const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/Users', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
  initSlots();
}).catch((err) => console.error('MongoDB error:', err));

// Mongoose model for slots
const SlotSchema = new mongoose.Schema({
  id: Number,
  status: String,
  ufid: String
});
const Slot = mongoose.model('Slot', SlotSchema);

// Initialize 16 slots if not already in DB
const initSlots = async () => {
  const count = await Slot.countDocuments();
  if (count === 0) {
    const newSlots = Array.from({ length: 16 }, (_, i) => ({
      id: i + 1,
      status: 'empty',
      ufid: null
    }));
    await Slot.insertMany(newSlots);
    console.log('Initialized 16 charger slots in MongoDB');
  }
};

// REST API: Reserve/unreserve a slot
app.post('/api/reserve', async (req, res) => {
  const { ufid, rcfid, status } = req.body;
  const newStatus = status === 1 ? 'reserved' : 'empty';

  try {
    await Slot.findOneAndUpdate(
      { id: rcfid },
      { status: newStatus, ufid },
      { new: true }
    );

    io.emit('slotUpdate', { id: rcfid, status: newStatus });
    res.json({ success: true });
  } catch (err) {
    console.error('Reservation error:', err);
    res.status(500).json({ success: false });
  }
});

// prints on page from backend and frontend if login was successful, and also post if login hasn't been registered
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
      const user = await User.findOne({ username });
      if (!user) {
          return res.status(400).json({ message: 'Username not found' });
      }


      if (user.password !== password) {
          return res.status(400).json({ message: 'Incorrect password' });
      }


      res.status(200).json({ message: 'Success' });
  } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Server error' });
  }
})

app.get('/', (req, res) => {
  res.send('API is running');
});

// prints on page from backend and frontend if signup was sucessful
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  console.log('Recieved signup request');
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('User already exists');
      return res.status(400).json({ message: 'Username already taken' });
    }
   
    // Create a new user
    const newUser = await User.create({ username, password });
    res.status(201).json({ message: 'User created', user: newUser });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Setup HTTP + WebSocket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Send initial slot data on client connect
io.on('connection', async (socket) => {
  console.log('Client connected:', socket.id);
  const allSlots = await Slot.find().sort({ id: 1 });
  socket.emit('init', allSlots);
});

// Start server
server.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
