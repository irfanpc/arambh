const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false
}));
app.use(cors({
  origin: '*' // Allow all origins for local testing (including file://)
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static frontend files
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/gallery',       require('./routes/gallery'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/media',         require('./routes/media'));

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use(errorHandler);
module.exports = app;
