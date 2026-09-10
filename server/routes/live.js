const express = require('express');
const router = express.Router();
const { query } = require('../db/database');
const requireAuth = require('../middleware/auth');

const LIVE_KEYS = ['live_video_id', 'live_is_active', 'live_status_message', 'live_updated_at'];
const DEFAULT_STATUS_MESSAGE = 'Reconnecting, please stay on this page';

function extractYouTubeId(input) {
  if (!input) return null;
  const trimmed = String(input).trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;

  let url;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, '').replace(/^m\./, '');

  if (host === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0];
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  }

  if (host === 'youtube.com' || host === 'music.youtube.com') {
    if (url.pathname === '/watch') {
      const id = url.searchParams.get('v');
      return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
    }
    const liveMatch = url.pathname.match(/^\/live\/([A-Za-z0-9_-]{11})/);
    if (liveMatch) return liveMatch[1];
    const embedMatch = url.pathname.match(/^\/embed\/([A-Za-z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];
  }

  return null;
}

async function readLiveConfig() {
  const result = await query(
    `SELECT key, value FROM config WHERE key = ANY($1)`,
    [LIVE_KEYS]
  );
  const map = {};
  result.rows.forEach(r => { map[r.key] = r.value; });
  return {
    videoId: map.live_video_id || '',
    isActive: map.live_is_active === 'true',
    statusMessage: map.live_status_message || DEFAULT_STATUS_MESSAGE,
    updatedAt: map.live_updated_at || null,
  };
}

router.get('/status', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    const status = await readLiveConfig();
    res.json(status);
  } catch (err) {
    console.error('live/status GET:', err.message);
    res.json({ videoId: '', isActive: false, statusMessage: DEFAULT_STATUS_MESSAGE, updatedAt: null });
  }
});

router.post('/update', requireAuth, async (req, res) => {
  try {
    const { url, isActive, statusMessage } = req.body;
    const writes = [];

    if (url !== undefined) {
      const videoId = extractYouTubeId(url);
      if (!videoId) {
        return res.status(400).json({
          error: "Couldn't read a YouTube video ID from that link. Paste a youtube.com/watch, youtu.be, /live/, or /embed/ link, or a bare 11-character video ID.",
        });
      }
      writes.push(['live_video_id', videoId]);
    }
    if (isActive !== undefined) {
      writes.push(['live_is_active', String(!!isActive)]);
    }
    if (statusMessage !== undefined) {
      writes.push(['live_status_message', String(statusMessage)]);
    }
    writes.push(['live_updated_at', new Date().toISOString()]);

    for (const [key, value] of writes) {
      await query(
        'INSERT INTO config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
        [key, value]
      );
    }

    const status = await readLiveConfig();
    res.json(status);
  } catch (err) {
    console.error('live/update POST:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
