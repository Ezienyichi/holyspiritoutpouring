require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://holyspiritoutpouring-ha9z.vercel.app',
  'https://holyspiritoutpouring.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  res.setTimeout(25000, () => {
    res.status(408).json({ error: 'Request timeout. Please try again.' });
  });
  next();
});

// Health routes first — no database needed, always respond
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Outpouring API' });
});

app.get('/api/health', async (req, res) => {
  const hasDbUrl = !!process.env.DATABASE_URL;
  let dbConnected = false;
  let dbError = null;

  if (hasDbUrl) {
    try {
      const { query } = require('./db/database');
      await query('SELECT 1');
      dbConnected = true;
    } catch (err) {
      dbError = err.message;
    }
  }

  res.json({
    status: 'ok',
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    database_url_set: hasDbUrl,
    database_connected: dbConnected,
    database_error: dbError,
    node_env: process.env.NODE_ENV,
  });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/config', require('./routes/config'));
app.use('/api/speakers', require('./routes/speakers'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/prayers', require('./routes/prayers'));
app.use('/api/media', require('./routes/media'));
app.use('/api/giving', require('./routes/giving'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/users', require('./routes/users'));
app.use('/api/previous-events', require('./routes/previousEvents'));
app.use('/api/past-ministers', require('./routes/pastMinisters'));
app.use('/api/sponsors', require('./routes/sponsors'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/visibility', require('./routes/visibility'));

// Local development only
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Outpouring '25 server → http://localhost:${PORT}`));
}

module.exports = app;
