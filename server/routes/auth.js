const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'outpouring_secret_key_2025';

router.post('/login', async (req, res) => {
  const { username, password, rememberMe } = req.body;
  console.log('[auth] Login attempt:', username);

  try {
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });
      const expiresIn = rememberMe ? '7d' : '24h';
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn }
      );
      return res.json({ token, username: user.username, role: user.role, name: user.name });
    }

    // No DB user found — try env var credentials
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'outpouring2025';
    if (username !== adminUser || password !== adminPass) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: 1, username, role: 'super_admin', name: 'Administrator' },
      JWT_SECRET,
      { expiresIn: rememberMe ? '7d' : '24h' }
    );
    return res.json({ token, username, role: 'super_admin', name: 'Administrator' });
  } catch (err) {
    console.error('[auth] Login DB error:', err.message, 'code:', err.code);
    // DB unreachable — fall through to env var credentials
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'outpouring2025';
    if (username === adminUser && password === adminPass) {
      const token = jwt.sign(
        { id: 1, username, role: 'super_admin', name: 'Administrator' },
        JWT_SECRET,
        { expiresIn: rememberMe ? '7d' : '24h' }
      );
      return res.json({ token, username, role: 'super_admin', name: 'Administrator' });
    }
    return res.status(401).json({ error: 'Invalid credentials' });
  }
});

router.post('/logout', (req, res) => res.json({ success: true }));

const requireAuth = require('../middleware/auth');
router.get('/verify', requireAuth, (req, res) => {
  res.json({ valid: true, user: req.user });
});

module.exports = router;
