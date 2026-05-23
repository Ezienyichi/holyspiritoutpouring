const express = require('express');
const router = express.Router();
const db = require('../db/database');
const requireAuth = require('../middleware/auth');

router.get('/', requireAuth, (req, res) => {
  res.json(db.prepare('SELECT * FROM giving ORDER BY createdAt DESC').all());
});

router.post('/', (req, res) => {
  const { name, email, amount, tier } = req.body;
  if (!amount || isNaN(amount)) return res.status(400).json({ error: 'Valid amount required' });
  const r = db.prepare('INSERT INTO giving (name,email,amount,tier) VALUES (?,?,?,?)').run(name||'',email||'',Number(amount),tier||'Custom');
  res.status(201).json({ success: true, id: r.lastInsertRowid });
});

module.exports = router;
