const express = require('express');
const router = express.Router();
const { query } = require('../db/database');
const requireAuth = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await query('SELECT * FROM giving ORDER BY "createdAt" DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, amount, tier, reason_for_giving } = req.body;
    if (!amount || isNaN(amount)) return res.status(400).json({ error: 'Valid amount required' });
    const result = await query(
      'INSERT INTO giving (name, email, amount, tier, reason_for_giving) VALUES ($1,$2,$3,$4,$5) RETURNING id',
      [name || '', email || '', Number(amount), tier || 'Custom', reason_for_giving || '']
    );
    res.status(201).json({ success: true, id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
