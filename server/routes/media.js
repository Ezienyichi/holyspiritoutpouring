const express = require('express');
const router = express.Router();
const db = require('../db/database');
const requireAuth = require('../middleware/auth');

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM media ORDER BY createdAt DESC').all());
});

router.post('/', requireAuth, (req, res) => {
  const { title, url, type, caption } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });
  const r = db.prepare('INSERT INTO media (title,url,type,caption) VALUES (?,?,?,?)').run(title||'',url,type||'photo',caption||'');
  res.status(201).json(db.prepare('SELECT * FROM media WHERE id=?').get(r.lastInsertRowid));
});

router.delete('/:id', requireAuth, (req, res) => {
  const r = db.prepare('DELETE FROM media WHERE id=?').run(req.params.id);
  if (!r.changes) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

module.exports = router;
