const express = require('express');
const router = express.Router();
const { query } = require('../db/database');
const requireAuth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM previous_events WHERE deleted IS NOT TRUE ORDER BY display_order ASC, year ASC');
    res.json(result.rows || []);
  } catch (err) {
    console.error('previous_events GET:', err.message);
    res.json([]);
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { year, title, tagline, image_url, highlights_url, display_order } = req.body;
    const result = await query(
      'INSERT INTO previous_events (year, title, tagline, image_url, highlights_url, display_order) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [year || '', title || '', tagline || '', image_url || '', highlights_url || '', Number(display_order) || 0]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { year, title, tagline, image_url, highlights_url, display_order } = req.body;
    const result = await query(
      'UPDATE previous_events SET year=$1, title=$2, tagline=$3, image_url=$4, highlights_url=$5, display_order=$6 WHERE id=$7 RETURNING *',
      [year || '', title || '', tagline || '', image_url || '', highlights_url || '', Number(display_order) || 0, Number(req.params.id)]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await query('DELETE FROM previous_events WHERE id = $1', [Number(req.params.id)]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
