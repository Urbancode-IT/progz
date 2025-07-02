const express = require('express');
const router = express.Router();
const NewUser = require('../models/NewUser');
const User = require('../models/User');

// Create new user form entry
router.post('/new-user', async (req, res) => {
  try {
    const newUser = new NewUser(req.body);
    await newUser.save();
    res.status(201).json({ message: 'User registration saved for approval.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all pending registrations
router.get('/pending', async (req, res) => {
  const pending = await NewUser.find();
  res.json(pending);
});

// Approve user
router.post('/approve/:id', async (req, res) => {
  try {
    const userToApprove = await NewUser.findById(req.params.id);
    if (!userToApprove) return res.status(404).json({ message: 'User not found' });

    const approvedUser = new User(userToApprove.toObject());
    await approvedUser.save();
    await userToApprove.deleteOne();

    res.json({ message: 'User approved and added to Users table.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Reject user
// Decline (delete) a pending user
router.delete('/decline/:id', async (req, res) => {
  try {
    const userToDecline = await NewUser.findById(req.params.id);
    if (!userToDecline) return res.status(404).json({ message: 'User not found' });

    await userToDecline.deleteOne();
    res.json({ message: 'User declined and removed from pending list.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
