const express = require('express');
const router = express.Router();
const { query } = require('../db/database');
const requireAuth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT key, value FROM config');
    const config = {};
    result.rows.forEach(r => { config[r.key] = r.value; });
    res.json(config);
  } catch (err) {
    console.error('config GET:', err.message);
    res.json({});
  }
});

router.put('/', requireAuth, async (req, res) => {
  try {
    for (const [k, v] of Object.entries(req.body)) {
      await query(
        'INSERT INTO config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
        [k, String(v)]
      );
    }
    const result = await query('SELECT key, value FROM config');
    const updated = {};
    result.rows.forEach(r => { updated[r.key] = r.value; });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
