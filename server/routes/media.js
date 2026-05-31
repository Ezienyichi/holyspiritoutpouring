const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { query } = require('../db/database');
const auth = require('../middleware/auth');
const router = require('express').Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const getCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  return cloudinary;
};

router.post('/upload', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ error: 'Cloudinary not configured. Add credentials to Vercel environment variables.' });
    }
    const cld = getCloudinary();
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cld.uploader.upload_stream(
        {
          folder: 'outpouring25',
          resource_type: 'image',
          timeout: 60000,
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
            { width: 1200, crop: 'limit' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });
    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

// Keep /upload-image for speakers (uses 'image' field already)
router.post('/upload-image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ error: 'Cloudinary not configured' });
    }
    const cld = getCloudinary();
    const result = await new Promise((resolve, reject) => {
      const stream = cld.uploader.upload_stream(
        { folder: 'outpouring25/speakers', resource_type: 'image', timeout: 60000 },
        (err, r) => err ? reject(err) : resolve(r)
      );
      stream.end(req.file.buffer);
    });
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const isAdmin = !!req.headers.authorization;
    const visClause = isAdmin ? '' : 'AND (visible = 1 OR visible IS NULL)';
    const result = await query(`SELECT * FROM media WHERE deleted IS NOT TRUE ${visClause} ORDER BY id DESC`);
    res.json(result.rows || []);
  } catch (err) {
    console.error('Media GET error:', err.message);
    res.json([]);
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, url, type, caption, thumbnailUrl, youtubeUrl } = req.body;
    const result = await query(
      'INSERT INTO media (title, url, type, caption, "thumbnailUrl", "youtubeUrl") VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [title || 'Untitled', url || '', type || 'photo', caption || '', thumbnailUrl || null, youtubeUrl || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Media POST error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, url, type, caption, thumbnailUrl, youtubeUrl } = req.body;
    const result = await query(
      'UPDATE media SET title=$1, url=$2, type=$3, caption=$4, "thumbnailUrl"=$5, "youtubeUrl"=$6 WHERE id=$7 RETURNING *',
      [title, url, type, caption, thumbnailUrl || null, youtubeUrl || null, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await query('UPDATE media SET deleted = TRUE WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/restore', auth, async (req, res) => {
  try {
    const result = await query('UPDATE media SET deleted = FALSE WHERE id = $1 RETURNING *', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
