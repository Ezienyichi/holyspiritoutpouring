const express = require('express');
const router = express.Router();
const { query } = require('../db/database');
const requireAuth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM speakers ORDER BY "displayOrder", id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, title, church, topic, bio, photoUrl, socialYoutube, socialInstagram, socialFacebook, displayOrder, role } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const result = await query(
      'INSERT INTO speakers (name, title, church, topic, bio, "photoUrl", "socialYoutube", "socialInstagram", "socialFacebook", "displayOrder", role) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *',
      [name, title || '', church || '', topic || '', bio || '', photoUrl || '', socialYoutube || '', socialInstagram || '', socialFacebook || '', displayOrder || 0, role || 'minister']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, title, church, topic, bio, photoUrl, socialYoutube, socialInstagram, socialFacebook, displayOrder, role } = req.body;
    const result = await query(
      'UPDATE speakers SET name=$1, title=$2, church=$3, topic=$4, bio=$5, "photoUrl"=$6, "socialYoutube"=$7, "socialInstagram"=$8, "socialFacebook"=$9, "displayOrder"=$10, role=$11 WHERE id=$12 RETURNING *',
      [name, title || '', church || '', topic || '', bio || '', photoUrl || '', socialYoutube || '', socialInstagram || '', socialFacebook || '', displayOrder || 0, role || 'minister', req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await query('DELETE FROM speakers WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
