const router = require('express').Router();
const { query } = require('../db/database');
const auth = require('../middleware/auth');

const ALLOWED = ['speakers', 'sessions', 'media', 'past_ministers', 'previous_events', 'testimonials'];

router.patch('/:table/:id/visibility', auth, async (req, res) => {
  try {
    const { table, id } = req.params;
    const { visible } = req.body;
    if (!ALLOWED.includes(table)) return res.status(400).json({ error: 'Invalid table name' });
    const result = await query(
      `UPDATE ${table} SET visible = $1 WHERE id = $2 RETURNING *`,
      [visible ? 1 : 0, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Visibility toggle error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
