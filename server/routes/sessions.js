const express = require('express');
const router = express.Router();
const { query } = require('../db/database');
const requireAuth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { day } = req.query;
    const isAdmin = !!req.headers.authorization;
    const visClause = isAdmin ? '' : 'AND (visible = 1 OR visible IS NULL)';
    const result = day
      ? await query(`SELECT * FROM sessions WHERE day = $1 ${visClause} ORDER BY time`, [Number(day)])
      : await query(`SELECT * FROM sessions WHERE 1=1 ${visClause} ORDER BY day, time`);
    res.json(result.rows || []);
  } catch (err) {
    console.error('sessions GET:', err.message);
    res.json([]);
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { day, time, title, speaker, type, description, isCurrentlyLive, visible } = req.body;
    if (!day || !time || !title) return res.status(400).json({ error: 'day, time, title required' });
    const result = await query(
      'INSERT INTO sessions (day, time, title, speaker, type, description, "isCurrentlyLive", visible) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [day, time, title, speaker || '', type || 'teaching', description || '', isCurrentlyLive ? 1 : 0, visible !== undefined ? visible : 1]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { day, time, title, speaker, type, description, isCurrentlyLive } = req.body;
    const result = await query(
      'UPDATE sessions SET day=$1, time=$2, title=$3, speaker=$4, type=$5, description=$6, "isCurrentlyLive"=$7 WHERE id=$8 RETURNING *',
      [day, time, title, speaker || '', type || 'teaching', description || '', isCurrentlyLive ? 1 : 0, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await query('DELETE FROM sessions WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
