const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'outpouring_secret_key_2025';

router.post('/login', (req, res) => {
  const { username, password, rememberMe } = req.body;

  // Try users table first
  const user = db.prepare('SELECT * FROM users WHERE username=?').get(username);
  if (user) {
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const expiresIn = rememberMe ? '7d' : '24h';
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn }
    );
    return res.json({ token, username: user.username, role: user.role, name: user.name });
  }

  // Fallback: env var plain text check
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'outpouring2025';
  if (username !== adminUser || password !== adminPass) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign(
    { username, role: 'super_admin', name: 'Administrator' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  res.json({ token, username, role: 'super_admin', name: 'Administrator' });
});

router.post('/logout', (req, res) => res.json({ success: true }));

module.exports = router;
