const express = require('express');
const router = express.Router();
const { query } = require('../db/database');
const requireAuth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const isAdmin = !!req.headers.authorization;
    const where = isAdmin
      ? 'WHERE deleted IS NOT TRUE'
      : 'WHERE deleted IS NOT TRUE AND (visible = 1 OR visible IS NULL)';
    const result = await query(`SELECT * FROM speakers ${where} ORDER BY "displayOrder", id`);
    res.json(result.rows || []);
  } catch (err) {
    console.error('speakers GET:', err.message);
    res.json([]);
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, title, church, topic, bio, photoUrl, socialYoutube, socialInstagram, socialFacebook, displayOrder, role, visible } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const result = await query(
      'INSERT INTO speakers (name, title, church, topic, bio, "photoUrl", "socialYoutube", "socialInstagram", "socialFacebook", "displayOrder", role, visible) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *',
      [name, title || '', church || '', topic || '', bio || '', photoUrl || '', socialYoutube || '', socialInstagram || '', socialFacebook || '', displayOrder || 0, role || 'minister', visible !== undefined ? visible : 1]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, title, church, topic, bio, photoUrl, socialYoutube, socialInstagram, socialFacebook, displayOrder, role, visible } = req.body;
    const result = await query(
      'UPDATE speakers SET name=$1, title=$2, church=$3, topic=$4, bio=$5, "photoUrl"=$6, "socialYoutube"=$7, "socialInstagram"=$8, "socialFacebook"=$9, "displayOrder"=$10, role=$11, visible=COALESCE($12, visible) WHERE id=$13 AND deleted IS NOT TRUE RETURNING *',
      [name, title || '', church || '', topic || '', bio || '', photoUrl || '', socialYoutube || '', socialInstagram || '', socialFacebook || '', displayOrder || 0, role || 'minister', visible !== undefined ? visible : null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await query('UPDATE speakers SET deleted = TRUE WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/restore', requireAuth, async (req, res) => {
  try {
    const result = await query('UPDATE speakers SET deleted = FALSE WHERE id = $1 RETURNING *', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
