const express = require('express');
const router = express.Router();
const db = require('../db/database');
const requireAuth = require('../middleware/auth');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM past_ministers ORDER BY display_order ASC, year DESC').all();
  res.json(rows);
});

router.post('/', requireAuth, (req, res) => {
  const { name, ministry_role, year, photo_url, display_order } = req.body;
  const stmt = db.prepare('INSERT INTO past_ministers (name, ministry_role, year, photo_url, display_order) VALUES (?, ?, ?, ?, ?)');
  const result = stmt.run(name || '', ministry_role || '', year || '', photo_url || '', Number(display_order) || 0);
  const row = db.prepare('SELECT * FROM past_ministers WHERE id = ?').get(result.lastInsertRowid);
  res.json(row);
});

router.put('/:id', requireAuth, (req, res) => {
  const { name, ministry_role, year, photo_url, display_order } = req.body;
  db.prepare('UPDATE past_ministers SET name = ?, ministry_role = ?, year = ?, photo_url = ?, display_order = ? WHERE id = ?')
    .run(name || '', ministry_role || '', year || '', photo_url || '', Number(display_order) || 0, Number(req.params.id));
  const row = db.prepare('SELECT * FROM past_ministers WHERE id = ?').get(Number(req.params.id));
  res.json(row);
});

router.delete('/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM past_ministers WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

module.exports = router;
