require('dotenv').config();
const https = require('https');
const app  = require('./src/app');
const pool = require('./src/config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await pool.query('SELECT 1'); // test DB connection
    console.log('✅ Database connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  }
}
start();

// Force Render deployment trigger

// Self-ping to prevent Render from sleeping (every 14 minutes)
const RENDER_URL = "https://arambh-bpuc.onrender.com";
setInterval(() => {
  https.get(RENDER_URL, (res) => {
    console.log(`[Self-Ping] Woke up Render. Status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error(`[Self-Ping Error]: ${err.message}`);
  });
}, 840000);
