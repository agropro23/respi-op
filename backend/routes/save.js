const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const Save = require('../models/Save');

// Register route
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const existingUser = await Save.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // const hashedPassword = await bcrypt.hash(password, 10);

    const save = new Save({
      username,
      password: password,
    });

    await save.save();

    res.status(201).json({
      message: 'User registered successfully',
      username,
    });
  } catch (err) {
    console.error('Error in /register:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save route
router.post('/save', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const existingUser = await Save.findOne({ username: email });

    if (existingUser) {
      return res.status(200).json({
        message: 'User already exists',
        username: existingUser.username,
      });
    }

    // const hashedPassword = await bcrypt.hash(password, 10);

    const savedUser = new Save({
        username: email,
        password: password,
    });

    await savedUser.save();

    res.status(201).json({
      message: 'User saved successfully',
      username: email,
    });
  } catch (err) {
    console.error('Error in /save:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  console.log('Login attempt:', { username });

  if (!username || !password) {
    console.log('Missing username or password');
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const save = await Save.findOne({ username });

    if (!save) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // const isMatch = await bcrypt.compare(password, user.password);

    const isMatch = password == save.password;

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({
      id: save._id,
      username: save.username,
    });

    res.json({ token });
  } catch (err) {
    console.error('Error in /login:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password route
router.put('/change-password', async (req, res) => {
  const { username, password, newPassword } = req.body;

  if (!username || !password || !newPassword) {
    return res.status(400).json({
      message: 'Username, current password, and new password are required',
    });
  }

  try {
    const save = await Save.findOne({ username });

    if (!save) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = password == save.password;

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // const hashedPassword = await bcrypt.hash(newPassword, 10);

    await Save.updateOne(
      { username },
      {
        $set: {
          password: newPassword,
        },
      }
    );

    res.status(200).json({
      message: 'Password changed successfully!',
    });
  } catch (err) {
    console.error('Error in /change-password:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change username route
router.put('/change-username', async (req, res) => {
  const { username, newUsername } = req.body;

  if (!username) {
    return res.status(400).json({ message: 'Existing username is required' });
  }

  if (!newUsername) {
    return res.status(400).json({ message: 'New username is required' });
  }

  try {
    const existingNewUser = await Save.findOne({ username: newUsername });

    if (existingNewUser) {
      return res.status(400).json({ message: 'Username already exists!' });
    }

    const save = await Save.findOne({ username });

    if (!save) {
      return res.status(400).json({ message: 'User does not exist!' });
    }

    await Save.updateOne(
      { _id: save._id },
      {
        $set: {
          username: newUsername,
        },
      }
    );

    res.status(200).json({
      message: 'Username changed successfully!',
    });
  } catch (err) {
    console.error('Error in /change-username:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/all-users', async (req, res) => {
  try {
    // Pass 'username phone' as the second argument
    const users = await Save.find({}, 'username password');

    res.status(200).json({
      users,
    });
  } catch (err) {
    console.error('Error in /all-users:', err);
    res.status(500).json({
      message: 'Server error',
    });
  }
});

module.exports = router;