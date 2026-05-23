const express = require('express');
const router = express.Router();
const db = require('../db/database');
const requireAuth = require('../middleware/auth');

router.get('/', (req, res) => {
  const { day } = req.query;
  const stmt = day
    ? db.prepare('SELECT * FROM sessions WHERE day=? ORDER BY time')
    : db.prepare('SELECT * FROM sessions ORDER BY day, time');
  res.json(day ? stmt.all(Number(day)) : stmt.all());
});

router.post('/', requireAuth, (req, res) => {
  const { day, time, title, speaker, type, description, isCurrentlyLive } = req.body;
  if (!day || !time || !title) return res.status(400).json({ error: 'day, time, title required' });
  const r = db.prepare('INSERT INTO sessions (day,time,title,speaker,type,description,isCurrentlyLive) VALUES (?,?,?,?,?,?,?)').run(day,time,title,speaker||'',type||'teaching',description||'',isCurrentlyLive?1:0);
  res.status(201).json(db.prepare('SELECT * FROM sessions WHERE id=?').get(r.lastInsertRowid));
});

router.put('/:id', requireAuth, (req, res) => {
  const { day, time, title, speaker, type, description, isCurrentlyLive } = req.body;
  const r = db.prepare('UPDATE sessions SET day=?,time=?,title=?,speaker=?,type=?,description=?,isCurrentlyLive=? WHERE id=?').run(day,time,title,speaker||'',type||'teaching',description||'',isCurrentlyLive?1:0,req.params.id);
  if (!r.changes) return res.status(404).json({ error: 'Not found' });
  res.json(db.prepare('SELECT * FROM sessions WHERE id=?').get(req.params.id));
});

router.delete('/:id', requireAuth, (req, res) => {
  const r = db.prepare('DELETE FROM sessions WHERE id=?').run(req.params.id);
  if (!r.changes) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

module.exports = router;
