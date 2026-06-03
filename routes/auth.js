const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const { validate, registerRules, loginRules } = require('../middleware/validate');

const generateToken = (userId, username) => {
  return jwt.sign(
    { id: userId, username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

router.post('/register', authLimiter, registerRules, validate, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(409).json({ success: false, message: 'Email already in use.' });
    }

    const usernameExists = await User.findOne({ username: { $regex: new RegExp('^' + username + '$', 'i') } });
    if (usernameExists) {
      return res.status(409).json({ success: false, message: 'Username already taken.' });
    }

    const user = await User.create({ username, email, password });
    const token = generateToken(user._id, user.username);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

router.post('/login', authLimiter, loginRules, validate, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: 'Account disabled.' });
    }

    user.lastLoginAt = Date.now();
    await user.save();

    const token = generateToken(user._id, user.username);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        lastLoginAt: user.lastLoginAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

router.get('/me', protect, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

router.post('/logout', (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

router.get('/settings', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, settings: user.settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/settings', protect, async (req, res) => {
  try {
    const { autoDeleteHistory, maxHistoryLength } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (autoDeleteHistory !== undefined) user.settings.autoDeleteHistory = autoDeleteHistory;
    if (maxHistoryLength !== undefined) {
      const len = parseInt(maxHistoryLength, 10);
      if (len >= 1 && len <= 100) {
        user.settings.maxHistoryLength = len;
      }
    }
    
    // Clean up history immediately if enabled and over limit
    if (user.settings.autoDeleteHistory && user.roomHistory.length > user.settings.maxHistoryLength) {
      user.roomHistory = user.roomHistory.slice(0, user.settings.maxHistoryLength);
    }
    
    await user.save();
    res.status(200).json({ success: true, settings: user.settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/delete', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Mark all their created rooms as inactive
    const Room = require('../models/Room');
    await Room.updateMany({ createdBy: user._id }, { isActive: false });

    // Delete the user completely
    await User.findByIdAndDelete(user._id);

    res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error deleting account' });
  }
});

module.exports = router;
