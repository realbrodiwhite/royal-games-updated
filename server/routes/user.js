const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const { createUser, getUserByUsername, updateUser, resetPassword } = require('../models/user');
const bcrypt = require('bcrypt');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const user = req.body;
  console.info('Attempting to create user:', user);

  createUser(user, (err, userId) => {
    if (err) {
      console.error('Error creating user:', err.message, err.stack);
      return res.status(500).json({ error: err.message });
    }
    console.info('User registered with ID:', userId);
    res.status(201).json({ userId });
  });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.info('Login attempt for username:', username);

  getUserByUsername(username, (err, user) => {
    if (err) {
      console.error('Error fetching user by username:', err.message, err.stack);
      return res.status(500).json({ error: err.message });
    }
    if (!user || !bcrypt.compareSync(password, user.password)) {
      console.warn('Invalid credentials for username:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.info('User logged in:', username);
    res.status(200).json({ user });
  });
});

router.put('/profile', upload.fields([{ name: 'profilePicture' }, { name: 'coverPhoto' }]), (req, res) => {
  const user = req.body;
  user.profilePicture = req.files['profilePicture'] ? req.files['profilePicture'][0].path : null;
  user.coverPhoto = req.files['coverPhoto'] ? req.files['coverPhoto'][0].path : null;

  console.info('Updating profile for user ID:', user.id);

  updateUser(user, (err) => {
    if (err) {
      console.error('Error updating user profile:', err.message, err.stack);
      return res.status(500).json({ error: err.message });
    }
    console.info('Profile updated for user ID:', user.id);
    res.status(200).json({ message: 'Profile updated successfully' });
  });
});

router.post('/reset-password', [
  body('newPassword').isLength({ min: 5 }).withMessage('New password must be at least 5 characters long')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId, newPassword } = req.body;
  console.info('Password reset attempt for user ID:', userId);

  resetPassword(userId, newPassword, (err) => {
    if (err) {
      console.error('Error resetting password:', err.message, err.stack);
      return res.status(500).json({ error: err.message });
    }
    console.info('Password reset for user ID:', userId);
    res.status(200).json({ message: 'Password reset successfully' });
  });
});

module.exports = router;