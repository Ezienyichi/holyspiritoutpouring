const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'outpouring2025';
  if (username !== adminUser || password !== adminPass) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ username, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, username });
});

router.post('/logout', (req, res) => res.json({ success: true }));

module.exports = router;
