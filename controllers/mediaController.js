const pool       = require('../config/db');
const cloudinary = require('../config/cloudinary');

exports.get = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM tour_media WHERE is_deleted = FALSE ORDER BY created_at DESC LIMIT 1'
    );
    if (!rows.length) return res.json(null);
    res.json(rows[0]);
  } catch (err) { next(err); }
};

exports.upsert = async (req, res, next) => {
  try {
    const { title, description, media_type = 'video',
            src_type = 'youtube', src, thumbnail_url } = req.body;

    if (!src && !req.file)
      return res.status(400).json({ error: 'src or media_file required' });

    const finalSrc          = req.file ? req.file.path     : src;
    const finalSrcType      = req.file ? 'cloudinary'      : src_type;
    const finalThumbnailUrl = thumbnail_url || null;

    // Soft-delete old record
    await pool.query('UPDATE tour_media SET is_deleted=TRUE WHERE is_deleted=FALSE');

    const { rows } = await pool.query(
      `INSERT INTO tour_media
         (title, description, media_type, src_type, src, thumbnail_url)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [title || 'School Tour', description || null, media_type,
       finalSrcType, finalSrc, finalThumbnailUrl]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await pool.query(
      'UPDATE tour_media SET is_deleted=TRUE WHERE is_deleted=FALSE'
    );
    res.json({ message: 'Tour media section hidden' });
  } catch (err) { next(err); }
};
