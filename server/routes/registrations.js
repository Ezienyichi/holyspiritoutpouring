const express = require('express');
const router = express.Router();
const { query } = require('../db/database');
const requireAuth = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await query('SELECT * FROM registrations ORDER BY "createdAt" DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, location, church, attendanceType } = req.body;
    if (!firstName || !lastName || !email) return res.status(400).json({ error: 'firstName, lastName, email required' });
    const result = await query(
      'INSERT INTO registrations ("firstName", "lastName", email, phone, location, church, "attendanceType") VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
      [firstName, lastName, email, phone || '', location || '', church || '', attendanceType || 'online']
    );
    res.status(201).json({ success: true, id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
