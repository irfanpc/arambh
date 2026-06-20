require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const pool   = require('../config/db');
const bcrypt = require('bcryptjs');

async function seed() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'aarambh@2026';
  const hash     = await bcrypt.hash(password, 12);

  const { rows } = await pool.query(
    `INSERT INTO admins (username, password)
     VALUES ($1, $2)
     ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password
     RETURNING id, username`,
    [username, hash]
  );

  console.log('✅ Admin seeded:', rows[0]);
  await pool.end();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
