const express = require('express');
const router = express.Router();
const db = require('../db/database');
const requireAuth = require('../middleware/auth');

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM media ORDER BY createdAt DESC').all());
});

router.post('/', requireAuth, (req, res) => {
  const { title, url, type, caption, thumbnailUrl, youtubeUrl } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });
  const r = db.prepare('INSERT INTO media (title,url,type,caption,thumbnailUrl,youtubeUrl) VALUES (?,?,?,?,?,?)').run(
    title || '', url, type || 'photo', caption || '', thumbnailUrl || null, youtubeUrl || null
  );
  res.status(201).json(db.prepare('SELECT * FROM media WHERE id=?').get(r.lastInsertRowid));
});

router.post('/upload', requireAuth, (req, res) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return res.status(503).json({ error: 'Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET env vars.' });
  }
  let multerLib, cldLib;
  try {
    multerLib = require('multer');
    cldLib = require('cloudinary').v2;
    cldLib.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  } catch {
    return res.status(503).json({ error: 'Upload dependencies not installed. Run: npm install cloudinary multer' });
  }
  const upload = multerLib({ storage: multerLib.memoryStorage() });
  upload.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cldLib.uploader.upload_stream(
          { folder: 'outpouring25', resource_type: 'auto' },
          (uploadErr, uploadResult) => uploadErr ? reject(uploadErr) : resolve(uploadResult)
        );
        stream.end(req.file.buffer);
      });
      res.json({ url: result.secure_url, public_id: result.public_id });
    } catch (e) {
      res.status(500).json({ error: 'Upload failed: ' + e.message });
    }
  });
});

router.delete('/:id', requireAuth, (req, res) => {
  const r = db.prepare('DELETE FROM media WHERE id=?').run(req.params.id);
  if (!r.changes) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

module.exports = router;
