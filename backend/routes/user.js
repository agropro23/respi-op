const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const User = require('../models/User');

// Register route (one-time setup, static credentials)
router.post('/register', async (req, res) => {
  // Static credentials for one-time setup
  // const username = 'admin@clinic.com';
  // const password = 'admin123'; // Change this to your desired password

  const {username, password} = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'Static user registered', username });
  } catch (err) {
    console.error('Error in /register:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', { username, password });
  if (!username || !password) {
    console.log('Missing username or password');
    return res.status(400).json({ message: 'Username and password are required' });
  }
  try {
    const user = await User.findOne({ username });
    console.log('User found:', user);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = generateToken({ id: user._id, username: user.username });
    res.json({ token });
  } catch (err) {
    console.error('Error in /login:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/change-password', async(req, res) => {
  const {username, password, newPassword} = req.body;

  if (!password) {
    console.log("Password is empty");
    return res.status(400).json({ message: 'Password is required' });
  }

  try{
    const user = await User.findOne({ username });
    console.log('User found:', user);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' }); 

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await User.updateOne(
      { username: username }, // Filter
      {
        $set: {
          password: hashedPassword
        }
      }
    );

    res.status(201).json({ message: 'Password changed successfully!'});
  } catch(err){
    console.error('Error occured in ', err);
    res.status(500).json({message: 'Server error'});
  }
})

router.put('/change-username', async(req, res) => {
  const {username, newUsername} = req.body;

  if (!username) {
    console.log("Existing username is empty");
    return res.status(400).json({ message: 'Existing username is empty' });
  }

  if (!newUsername) {
    console.log("Username is empty");
    return res.status(400).json({ message: 'Username is required' });
  }

  try{

    const newUser = await User.findOne({newUsername});
    if(newUser) return res.status(400).json({ message: 'Username already exists!' });

    const user = await User.findOne({ username });
    console.log('User found:', user);

    if (!user) return res.status(400).json({ message: 'User does not exists!' });

    const id = user._id;

    const result = await User.updateOne(
      {_id: id},
      {
        $set : {
          username : newUsername
        }
      }
    );

    res.status(201).json({ message: 'Username changed successfully!'});
  } catch(err){
    console.error('Error occured in ', err);
    res.status(500).json({message: 'Server error'});
  }
})

module.exports = router; 