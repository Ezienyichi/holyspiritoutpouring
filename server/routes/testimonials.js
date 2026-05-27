const express = require('express');
const router = express.Router();
const { query } = require('../db/database');

router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM testimonials WHERE approved = TRUE OR approved = 1 ORDER BY created_at DESC`
    );
    res.json(result.rows || []);
  } catch (err) {
    res.json([]);
  }
});

module.exports = router;
