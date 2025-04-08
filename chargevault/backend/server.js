//npm start command
//API Codes
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/user.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// transport data frontend and backend code to json
const app = express();
app.use(cors());
app.use(express.json());
mongoose.connect("mongodb://127.0.0.1:27017/Users");

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
});


app.get('/', (req, res) => {
    res.send('API is running');
})

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
  

app.listen(3001, () => console.log('Server running on port 3001'));
