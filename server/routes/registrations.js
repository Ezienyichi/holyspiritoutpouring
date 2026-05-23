const express = require('express');
const router = express.Router();
const db = require('../db/database');
const requireAuth = require('../middleware/auth');

router.get('/', requireAuth, (req, res) => {
  res.json(db.prepare('SELECT * FROM registrations ORDER BY createdAt DESC').all());
});

router.post('/', (req, res) => {
  const { firstName, lastName, email, phone, attendanceType } = req.body;
  if (!firstName || !lastName || !email) return res.status(400).json({ error: 'firstName, lastName, email required' });
  const r = db.prepare('INSERT INTO registrations (firstName,lastName,email,phone,attendanceType) VALUES (?,?,?,?,?)').run(firstName,lastName,email,phone||'',attendanceType||'online');
  res.status(201).json({ success: true, id: r.lastInsertRowid });
});

module.exports = router;
