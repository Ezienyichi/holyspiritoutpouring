const express = require('express');
const router = express.Router();
const db = require('../db/database');
const requireAuth = require('../middleware/auth');

router.get('/', requireAuth, (req, res) => {
  res.json(db.prepare('SELECT * FROM giving ORDER BY createdAt DESC').all());
});

router.post('/', (req, res) => {
  const { name, email, amount, tier, reason_for_giving } = req.body;
  if (!amount || isNaN(amount)) return res.status(400).json({ error: 'Valid amount required' });
  const r = db.prepare('INSERT INTO giving (name,email,amount,tier,reason_for_giving) VALUES (?,?,?,?,?)').run(name||'',email||'',Number(amount),tier||'Custom',reason_for_giving||'');
  res.status(201).json({ success: true, id: r.lastInsertRowid });
});

module.exports = router;
