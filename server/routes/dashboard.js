const router = require('express').Router();
const { query } = require('../db/database');
const requireAuth = require('../middleware/auth');

router.get('/stats', requireAuth, async (req, res) => {
  try {
    const [speakersR, sessionsR, prayersR, regsR, mediaR, givingR] = await Promise.allSettled([
      query('SELECT COUNT(*) as count FROM speakers WHERE deleted IS NOT TRUE'),
      query('SELECT COUNT(*) as count FROM sessions'),
      query('SELECT COUNT(*) as count FROM prayers'),
      query('SELECT COUNT(*) as count FROM registrations'),
      query('SELECT COUNT(*) as count FROM media WHERE deleted IS NOT TRUE'),
      query('SELECT COUNT(*) as count, COALESCE(SUM(amount),0) as total FROM giving'),
    ]);

    const safe = (r, field = 'count') =>
      r.status === 'fulfilled' ? (r.value?.rows?.[0]?.[field] || 0) : 0;

    res.json({
      speakers: parseInt(safe(speakersR)),
      sessions: parseInt(safe(sessionsR)),
      prayers: parseInt(safe(prayersR)),
      registrations: parseInt(safe(regsR)),
      media: parseInt(safe(mediaR)),
      giving: parseInt(safe(givingR)),
      totalGiving: parseFloat(safe(givingR, 'total')),
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.json({ speakers: 0, sessions: 0, prayers: 0, registrations: 0, media: 0, giving: 0, totalGiving: 0 });
  }
});

module.exports = router;
