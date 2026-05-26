const express = require('express');
const router = express.Router();
const db = require('../db/database');
const requireAuth = require('../middleware/auth');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM previous_events ORDER BY display_order ASC, year ASC').all();
  res.json(rows);
});

router.post('/', requireAuth, (req, res) => {
  const { year, title, tagline, image_url, highlights_url, display_order } = req.body;
  const stmt = db.prepare('INSERT INTO previous_events (year, title, tagline, image_url, highlights_url, display_order) VALUES (?, ?, ?, ?, ?, ?)');
  const result = stmt.run(year || '', title || '', tagline || '', image_url || '', highlights_url || '', Number(display_order) || 0);
  const row = db.prepare('SELECT * FROM previous_events WHERE id = ?').get(result.lastInsertRowid);
  res.json(row);
});

router.put('/:id', requireAuth, (req, res) => {
  const { year, title, tagline, image_url, highlights_url, display_order } = req.body;
  db.prepare('UPDATE previous_events SET year = ?, title = ?, tagline = ?, image_url = ?, highlights_url = ?, display_order = ? WHERE id = ?')
    .run(year || '', title || '', tagline || '', image_url || '', highlights_url || '', Number(display_order) || 0, Number(req.params.id));
  const row = db.prepare('SELECT * FROM previous_events WHERE id = ?').get(Number(req.params.id));
  res.json(row);
});

router.delete('/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM previous_events WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

module.exports = router;
