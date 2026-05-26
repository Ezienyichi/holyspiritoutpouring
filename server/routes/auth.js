const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'outpouring_secret_key_2025';

router.post('/login', async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;

    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/logout', (req, res) => res.json({ success: true }));

const requireAuth = require('../middleware/auth');
router.get('/verify', requireAuth, (req, res) => {
  res.json({ valid: true, user: req.user });
});

module.exports = router;
