const express = require('express');
const router = express.Router();
const { query } = require('../db/database');
const requireAuth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM sponsors WHERE active = 1 AND (deleted IS NOT TRUE) ORDER BY display_order ASC, id ASC"
    );
    res.json(result.rows || []);
  } catch (err) {
    console.error('sponsors GET:', err.message);
    res.json([]);
  }
});

router.get('/all', requireAuth, async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM sponsors WHERE deleted IS NOT TRUE ORDER BY display_order ASC, id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, logo_url, website_url, display_order, active } = req.body;
    const result = await query(
      'INSERT INTO sponsors (name, logo_url, website_url, display_order, active) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name || '', logo_url || '', website_url || '', Number(display_order) || 0, active === false || active === 0 || active === 'false' ? 0 : 1]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, logo_url, website_url, display_order, active } = req.body;
    const result = await query(
      'UPDATE sponsors SET name=$1, logo_url=$2, website_url=$3, display_order=$4, active=$5 WHERE id=$6 AND deleted IS NOT TRUE RETURNING *',
      [name || '', logo_url || '', website_url || '', Number(display_order) || 0, active === false || active === 0 || active === 'false' ? 0 : 1, Number(req.params.id)]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await query('UPDATE sponsors SET deleted = TRUE WHERE id = $1', [Number(req.params.id)]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/restore', requireAuth, async (req, res) => {
  try {
    const result = await query('UPDATE sponsors SET deleted = FALSE WHERE id = $1 RETURNING *', [Number(req.params.id)]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
