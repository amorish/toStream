const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
    match: /^[a-zA-Z0-9_]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  roomHistory: {
    type: [String],
    default: []
  },
  settings: {
    autoDeleteHistory: { type: Boolean, default: false },
    maxHistoryLength: { type: Number, default: 20 }
  }
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.addToHistory = async function (roomId) {
  this.roomHistory.unshift(roomId);
  if (this.roomHistory.length > 20) {
    this.roomHistory.pop();
  }
  await this.save();
};

UserSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
