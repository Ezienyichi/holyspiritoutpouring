const express = require('express');
const router = express.Router();
const { query } = require('../db/database');
const requireAuth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM past_ministers WHERE deleted IS NOT TRUE ORDER BY display_order ASC, year DESC');
    res.json(result.rows || []);
  } catch (err) {
    console.error('past_ministers GET:', err.message);
    res.json([]);
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, ministry_role, year, photo_url, display_order } = req.body;
    const result = await query(
      'INSERT INTO past_ministers (name, ministry_role, year, photo_url, display_order) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name || '', ministry_role || '', year || '', photo_url || '', Number(display_order) || 0]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, ministry_role, year, photo_url, display_order } = req.body;
    const result = await query(
      'UPDATE past_ministers SET name=$1, ministry_role=$2, year=$3, photo_url=$4, display_order=$5 WHERE id=$6 RETURNING *',
      [name || '', ministry_role || '', year || '', photo_url || '', Number(display_order) || 0, Number(req.params.id)]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await query('DELETE FROM past_ministers WHERE id = $1', [Number(req.params.id)]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
