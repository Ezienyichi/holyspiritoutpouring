require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/config', require('./routes/config'));
app.use('/api/speakers', require('./routes/speakers'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/prayers', require('./routes/prayers'));
app.use('/api/media', require('./routes/media'));
app.use('/api/giving', require('./routes/giving'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/chat', require('./routes/chat'));

app.listen(PORT, () => console.log(`Outpouring '25 server → http://localhost:${PORT}`));
