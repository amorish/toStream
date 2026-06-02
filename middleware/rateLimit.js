const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 900000, // 15 min
  max: process.env.RATE_LIMIT_MAX || 100,
  message: { success: false, message: 'Too many requests. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 900000, // 15 min
  max: process.env.AUTH_RATE_LIMIT_MAX || 10,
  message: { success: false, message: 'Too many login attempts. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

const roomCreateLimiter = rateLimit({
  windowMs: 3600000, // 1 hour
  max: process.env.ROOM_CREATE_RATE_LIMIT_MAX || 5,
  message: { success: false, message: 'Room creation limit reached. Try again in an hour.' }
});

module.exports = { apiLimiter, authLimiter, roomCreateLimiter };
