const express = require('express');
const router = express.Router();
const db = require('../db/database');
const requireAuth = require('../middleware/auth');

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM speakers ORDER BY displayOrder, id').all());
});

router.post('/', requireAuth, (req, res) => {
  const { name, title, church, topic, bio, photoUrl, socialYoutube, socialInstagram, socialFacebook, displayOrder } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const r = db.prepare('INSERT INTO speakers (name,title,church,topic,bio,photoUrl,socialYoutube,socialInstagram,socialFacebook,displayOrder) VALUES (?,?,?,?,?,?,?,?,?,?)').run(name,title||'',church||'',topic||'',bio||'',photoUrl||'',socialYoutube||'',socialInstagram||'',socialFacebook||'',displayOrder||0);
  res.status(201).json(db.prepare('SELECT * FROM speakers WHERE id=?').get(r.lastInsertRowid));
});

router.put('/:id', requireAuth, (req, res) => {
  const { name, title, church, topic, bio, photoUrl, socialYoutube, socialInstagram, socialFacebook, displayOrder } = req.body;
  const r = db.prepare('UPDATE speakers SET name=?,title=?,church=?,topic=?,bio=?,photoUrl=?,socialYoutube=?,socialInstagram=?,socialFacebook=?,displayOrder=? WHERE id=?').run(name,title||'',church||'',topic||'',bio||'',photoUrl||'',socialYoutube||'',socialInstagram||'',socialFacebook||'',displayOrder||0,req.params.id);
  if (!r.changes) return res.status(404).json({ error: 'Not found' });
  res.json(db.prepare('SELECT * FROM speakers WHERE id=?').get(req.params.id));
});

router.delete('/:id', requireAuth, (req, res) => {
  const r = db.prepare('DELETE FROM speakers WHERE id=?').run(req.params.id);
  if (!r.changes) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

module.exports = router;
