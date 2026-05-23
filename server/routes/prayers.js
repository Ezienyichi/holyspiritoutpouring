const express = require('express');
const router = express.Router();
const db = require('../db/database');
const requireAuth = require('../middleware/auth');

router.get('/', (req, res) => {
  const { all } = req.query;
  const stmt = all
    ? db.prepare('SELECT * FROM prayers ORDER BY createdAt DESC')
    : db.prepare('SELECT * FROM prayers WHERE approved=1 ORDER BY createdAt DESC');
  res.json(stmt.all());
});

router.post('/', (req, res) => {
  const { name, email, category, text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'Prayer text required' });
  const r = db.prepare('INSERT INTO prayers (name,email,category,text) VALUES (?,?,?,?)').run(name||'Anonymous',email||'',category||'Other',text.trim());
  res.status(201).json(db.prepare('SELECT * FROM prayers WHERE id=?').get(r.lastInsertRowid));
});

router.put('/:id/pray', (req, res) => {
  const r = db.prepare('UPDATE prayers SET prayCount=prayCount+1 WHERE id=?').run(req.params.id);
  if (!r.changes) return res.status(404).json({ error: 'Not found' });
  res.json({ prayCount: db.prepare('SELECT prayCount FROM prayers WHERE id=?').get(req.params.id).prayCount });
});

router.patch('/:id/approve', requireAuth, (req, res) => {
  const { approved } = req.body;
  db.prepare('UPDATE prayers SET approved=? WHERE id=?').run(approved ? 1 : 0, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', requireAuth, (req, res) => {
  const r = db.prepare('DELETE FROM prayers WHERE id=?').run(req.params.id);
  if (!r.changes) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

module.exports = router;
