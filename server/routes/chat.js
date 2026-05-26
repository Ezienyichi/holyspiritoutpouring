const express = require('express');
const router = express.Router();
const { query } = require('../db/database');

router.get('/', async (req, res) => {
  try {
    const since = req.query.since;
    const result = since
      ? await query('SELECT * FROM chat WHERE id > $1 ORDER BY "createdAt" ASC LIMIT 50', [Number(since)])
      : await query('SELECT * FROM chat ORDER BY "createdAt" ASC LIMIT 50');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { username, message } = req.body;
    if (!username?.trim() || !message?.trim()) return res.status(400).json({ error: 'username and message required' });
    const result = await query(
      'INSERT INTO chat (username, message) VALUES ($1, $2) RETURNING *',
      [username.trim(), message.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
