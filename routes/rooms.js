const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');
const { protect } = require('../middleware/auth');
const { roomCreateLimiter } = require('../middleware/rateLimit');
const { validate, createRoomRules, joinRoomRules } = require('../middleware/validate');

router.use(protect);

router.post('/create', roomCreateLimiter, createRoomRules, validate, async (req, res) => {
  try {
    const { name, mode, password, description } = req.body;
    
    if (!password || password.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Password is required to create a meeting.' });
    }

    let roomId = nanoid(10);
    
    let collisionCount = 0;
    while (await Room.findOne({ roomId })) {
      collisionCount++;
      if (collisionCount >= 3) {
        return res.status(500).json({ success: false, message: 'Could not generate unique room ID.' });
      }
      roomId = nanoid(10);
    }

    // When admin creates a new room, their old rooms automatically expire
    await Room.updateMany({ createdBy: req.user._id, isActive: true }, { isActive: false });


    const roomData = {
      roomId,
      createdBy: req.user._id,
      participants: [{ userId: req.user._id }],
      mode: mode || 'camera',
      name: name || '',
      description: description || ''
    };

    const salt = await bcrypt.genSalt(10);
    roomData.roomPassword = await bcrypt.hash(password, salt);

    const room = await Room.create(roomData);

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { roomHistory: roomId } });

    res.status(201).json({
      success: true,
      room: {
        roomId: room.roomId,
        name: room.name,
        mode: room.mode,
        createdAt: room.createdAt,
        expiresAt: room.expiresAt,
        hasPassword: !!roomData.roomPassword
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error creating room.' });
  }
});

router.post('/join', joinRoomRules, validate, async (req, res) => {
  try {
    const { roomId, password } = req.body;
    const room = await Room.findActiveByRoomId(roomId);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found or has expired.' });
    }

    if (room.isExpired()) {
      return res.status(410).json({ success: false, message: 'This room has expired.' });
    }

    if (room.isFull() && !room.hasParticipant(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Room is full. Maximum 2 people.' });
    }

    if (room.hasParticipant(req.user._id)) {
      return res.status(200).json({
        success: true,
        room: {
          roomId: room.roomId,
          name: room.name,
          mode: room.mode,
          createdAt: room.createdAt,
          expiresAt: room.expiresAt
        }
      });
    }

    if (room.roomPassword) {
      if (!password) {
        return res.status(403).json({ success: false, message: 'This room requires a password.' });
      }
      const isMatch = await bcrypt.compare(password, room.roomPassword);
      if (!isMatch) {
        return res.status(403).json({ success: false, message: 'Incorrect room password.' });
      }
    }

    room.participants.push({ userId: req.user._id });
    await room.save();

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { roomHistory: roomId } });

    res.status(200).json({
      success: true,
      room: {
        roomId: room.roomId,
        name: room.name,
        mode: room.mode,
        createdAt: room.createdAt,
        expiresAt: room.expiresAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error joining room.' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const rooms = await Room.find({ roomId: { $in: req.user.roomHistory } })
      .select('roomId name description mode isActive createdAt expiresAt')
      .sort({ createdAt: -1 })
      .limit(10);
    
    const mappedRooms = rooms.map(r => {
      const roomObj = r.toObject();
      roomObj.isExpired = new Date() > r.expiresAt;
      return roomObj;
    });

    res.status(200).json({ success: true, rooms: mappedRooms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching history.' });
  }
});

router.get('/:roomId', async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId, isActive: true });
    
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }

    if (!room.hasParticipant(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You are not a participant in this room.' });
    }

    const roomObj = room.toObject();
    delete roomObj.roomPassword;
    
    res.status(200).json({ success: true, room: roomObj });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching room.' });
  }
});

router.delete('/:roomId', async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }

    if (room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the room creator can delete this room.' });
    }

    room.isActive = false;
    await room.save();

    res.status(200).json({ success: true, message: 'Room closed.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error deleting room.' });
  }
});

module.exports = router;
