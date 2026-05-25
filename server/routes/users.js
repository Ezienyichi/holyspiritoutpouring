const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const requireAuth = require('../middleware/auth');

function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Forbidden: super_admin only' });
  }
  next();
}

router.get('/', requireAuth, requireSuperAdmin, (req, res) => {
  const users = db.prepare('SELECT * FROM users ORDER BY createdAt').all();
  res.json(users.map(({ password, ...u }) => u));
});

router.post('/', requireAuth, requireSuperAdmin, (req, res) => {
  const { username, password, name, role } = req.body;
  if (!username || !password || !name || !role) {
    return res.status(400).json({ error: 'All fields required' });
  }
  const existing = db.prepare('SELECT * FROM users WHERE username=?').get(username);
  if (existing) return res.status(409).json({ error: 'Username already exists' });
  const hash = bcrypt.hashSync(password, 10);
  const r = db.prepare('INSERT INTO users (username,password,name,role) VALUES (?,?,?,?)').run(username, hash, name, role);
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(r.lastInsertRowid);
  const { password: _, ...safeUser } = user;
  res.status(201).json(safeUser);
});

router.put('/:id', requireAuth, requireSuperAdmin, (req, res) => {
  const { name, role, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(Number(req.params.id));
  if (!user) return res.status(404).json({ error: 'Not found' });
  const newName = name || user.name;
  const newRole = role || user.role;
  if (password) {
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('UPDATE users SET password=?,name=?,role=? WHERE id=?').run(hash, newName, newRole, user.id);
  } else {
    db.prepare('UPDATE users SET name=?,role=? WHERE id=?').run(newName, newRole, user.id);
  }
  const updated = db.prepare('SELECT * FROM users WHERE id=?').get(user.id);
  const { password: _, ...safeUser } = updated;
  res.json(safeUser);
});

router.delete('/:id', requireAuth, requireSuperAdmin, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(Number(req.params.id));
  if (!user) return res.status(404).json({ error: 'Not found' });
  if (user.username === 'admin') return res.status(403).json({ error: 'Cannot delete main admin' });
  db.prepare('DELETE FROM users WHERE id=?').run(user.id);
  res.json({ success: true });
});

module.exports = router;
