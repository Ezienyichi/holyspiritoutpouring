const express = require('express');
const router = express.Router();
const db = require('../db/database');
const requireAuth = require('../middleware/auth');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM config').all();
  const config = {};
  rows.forEach(r => { config[r.key] = r.value; });
  res.json(config);
});

router.put('/', requireAuth, (req, res) => {
  const upsert = db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)');
  db.transaction(() => {
    Object.entries(req.body).forEach(([k, v]) => upsert.run(k, String(v)));
  })();
  const rows = db.prepare('SELECT key, value FROM config').all();
  const updated = {};
  rows.forEach(r => { updated[r.key] = r.value; });
  res.json(updated);
});

module.exports = router;
