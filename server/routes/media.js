const express = require('express');
const router = express.Router();
const { query } = require('../db/database');
const requireAuth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM media ORDER BY "createdAt" DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, url, type, caption, thumbnailUrl, youtubeUrl } = req.body;
    if (!url) return res.status(400).json({ error: 'URL required' });
    const result = await query(
      'INSERT INTO media (title, url, type, caption, "thumbnailUrl", "youtubeUrl") VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [title || '', url, type || 'photo', caption || '', thumbnailUrl || null, youtubeUrl || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/upload-image', requireAuth, (req, res) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return res.status(500).json({ error: 'Cloudinary not configured' });
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
    return res.status(503).json({ error: 'Upload dependencies not installed' });
  }
  const upload = multerLib({ storage: multerLib.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
  upload.single('image')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cldLib.uploader.upload_stream(
          { folder: 'outpouring25/speakers', resource_type: 'image' },
          (uploadErr, uploadResult) => uploadErr ? reject(uploadErr) : resolve(uploadResult)
        );
        stream.end(req.file.buffer);
      });
      res.json({ url: result.secure_url, publicId: result.public_id });
    } catch (e) {
      res.status(500).json({ error: 'Upload failed: ' + e.message });
    }
  });
});

router.post('/upload', requireAuth, (req, res) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return res.status(500).json({ error: 'Cloudinary not configured' });
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

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await query('DELETE FROM media WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
