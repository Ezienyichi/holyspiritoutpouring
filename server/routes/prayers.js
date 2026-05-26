const express = require('express');
const router = express.Router();
const { query } = require('../db/database');
const requireAuth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { all } = req.query;
    const result = all
      ? await query('SELECT * FROM prayers ORDER BY "createdAt" DESC')
      : await query('SELECT * FROM prayers WHERE approved = 1 ORDER BY "createdAt" DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, category, text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Prayer text required' });
    const result = await query(
      'INSERT INTO prayers (name, email, category, text) VALUES ($1,$2,$3,$4) RETURNING *',
      [name || 'Anonymous', email || '', category || 'Other', text.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/pray', async (req, res) => {
  try {
    const result = await query(
      'UPDATE prayers SET "prayCount" = "prayCount" + 1 WHERE id = $1 RETURNING "prayCount"',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ prayCount: result.rows[0].prayCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/approve', requireAuth, async (req, res) => {
  try {
    const { approved } = req.body;
    await query('UPDATE prayers SET approved = $1 WHERE id = $2', [approved ? 1 : 0, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await query('DELETE FROM prayers WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
