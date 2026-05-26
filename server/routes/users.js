const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query } = require('../db/database');
const requireAuth = require('../middleware/auth');

function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Forbidden: super_admin only' });
  }
  next();
}

router.get('/', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const result = await query('SELECT * FROM users ORDER BY "createdAt"');
    res.json(result.rows.map(({ password, ...u }) => u));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { username, password, name, role } = req.body;
    if (!username || !password || !name || !role) {
      return res.status(400).json({ error: 'All fields required' });
    }
    const existing = await query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Username already exists' });
    const hash = bcrypt.hashSync(password, 10);
    const result = await query(
      'INSERT INTO users (username, password, name, role) VALUES ($1,$2,$3,$4) RETURNING *',
      [username, hash, name, role]
    );
    const { password: _, ...safeUser } = result.rows[0];
    res.status(201).json(safeUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { name, role, password } = req.body;
    const userResult = await query('SELECT * FROM users WHERE id = $1', [Number(req.params.id)]);
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ error: 'Not found' });
    const newName = name || user.name;
    const newRole = role || user.role;
    let updated;
    if (password) {
      const hash = bcrypt.hashSync(password, 10);
      updated = await query(
        'UPDATE users SET password=$1, name=$2, role=$3 WHERE id=$4 RETURNING *',
        [hash, newName, newRole, user.id]
      );
    } else {
      updated = await query(
        'UPDATE users SET name=$1, role=$2 WHERE id=$3 RETURNING *',
        [newName, newRole, user.id]
      );
    }
    const { password: _, ...safeUser } = updated.rows[0];
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const userResult = await query('SELECT * FROM users WHERE id = $1', [Number(req.params.id)]);
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ error: 'Not found' });
    if (user.username === 'admin') return res.status(403).json({ error: 'Cannot delete main admin' });
    await query('DELETE FROM users WHERE id = $1', [user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
