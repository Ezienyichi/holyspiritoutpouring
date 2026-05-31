const express = require('express');
const router = express.Router();
const { query } = require('../db/database');
const requireAuth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const isAdmin = !!req.headers.authorization;
    const where = isAdmin
      ? ''
      : 'WHERE (approved = 1 OR approved = TRUE) AND (visible = 1 OR visible IS NULL)';
    const result = await query(`SELECT * FROM testimonials ${where} ORDER BY created_at DESC`);
    res.json(result.rows || []);
  } catch (err) {
    res.json([]);
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, location, year, text, approved, visible } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Text is required' });
    const result = await query(
      'INSERT INTO testimonials (name, location, year, text, approved, visible) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name || 'Anonymous', location || '', year || '', text, approved ? 1 : 0, visible !== undefined ? visible : 1]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, location, year, text, approved, visible } = req.body;
    const result = await query(
      'UPDATE testimonials SET name=$1, location=$2, year=$3, text=$4, approved=$5, visible=COALESCE($6, visible) WHERE id=$7 RETURNING *',
      [name || 'Anonymous', location || '', year || '', text || '', approved ? 1 : 0, visible !== undefined ? visible : null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await query('DELETE FROM testimonials WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
