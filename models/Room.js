const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    trim: true,
    maxlength: 50,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: {
    type: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      socketId: String,
      joinedAt: { type: Date, default: Date.now }
    }],
    default: []
  },
  maxParticipants: {
    type: Number,
    default: 2
  },
  mode: {
    type: String,
    enum: ['camera', 'url-video', 'music'],
    default: 'camera'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  roomPassword: {
    type: String
  },
  videoUrl: {
    type: String,
    default: ''
  },
  videoState: {
    playing: { type: Boolean, default: false },
    currentTime: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
  }
});

RoomSchema.methods.isFull = function() {
  return this.participants.length >= this.maxParticipants;
};

RoomSchema.methods.hasParticipant = function(userId) {
  return this.participants.some(p => p.userId.toString() === userId.toString());
};

RoomSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

RoomSchema.statics.findActiveByRoomId = function(roomId) {
  return this.findOne({
    roomId: roomId,
    isActive: true,
    expiresAt: { $gt: new Date() }
  });
};

RoomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
RoomSchema.index({ isActive: 1, createdBy: 1 });

module.exports = mongoose.models.Room || mongoose.model('Room', RoomSchema);
