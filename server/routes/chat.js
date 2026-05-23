const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/', (req, res) => {
  const since = req.query.since;
  const stmt = since
    ? db.prepare('SELECT * FROM chat WHERE id > ? ORDER BY createdAt ASC LIMIT 50')
    : db.prepare('SELECT * FROM chat ORDER BY createdAt ASC LIMIT 50');
  res.json(since ? stmt.all(Number(since)) : stmt.all());
});

router.post('/', (req, res) => {
  const { username, message } = req.body;
  if (!username?.trim() || !message?.trim()) return res.status(400).json({ error: 'username and message required' });
  const r = db.prepare('INSERT INTO chat (username, message) VALUES (?, ?)').run(username.trim(), message.trim());
  res.status(201).json(db.prepare('SELECT * FROM chat WHERE id=?').get(r.lastInsertRowid));
});

module.exports = router;
