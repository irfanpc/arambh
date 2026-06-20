const pool       = require('../config/db');
const cloudinary = require('../config/cloudinary');

exports.getAll = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM gallery_images ORDER BY sort_order ASC, created_at ASC'
    );
    res.json(rows);
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM gallery_images WHERE id = $1', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Image file required' });
    const { title = 'Untitled', category = 'classroom' } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO gallery_images (title, category, cloudinary_id, url, sort_order)
       VALUES ($1, $2, $3, $4,
         (SELECT COALESCE(MAX(sort_order) + 1, 0) FROM gallery_images))
       RETURNING *`,
      [title, category, req.file.filename, req.file.path]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { title, category } = req.body;
    const { rows } = await pool.query(
      `UPDATE gallery_images
       SET title=$1, category=$2
       WHERE id=$3
       RETURNING *`,
      [title, category, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

exports.reorder = async (req, res, next) => {
  try {
    const { order } = req.body; // [{ id, sort_order }, ...]
    if (!Array.isArray(order))
      return res.status(400).json({ error: 'order must be an array' });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const item of order) {
        await client.query(
          'UPDATE gallery_images SET sort_order=$1 WHERE id=$2',
          [item.sort_order, item.id]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
    res.json({ message: 'Reordered successfully' });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM gallery_images WHERE id=$1 RETURNING cloudinary_id',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    try {
      await cloudinary.uploader.destroy(rows[0].cloudinary_id);
    } catch (e) {
      console.warn('Cloudinary delete warning:', e.message);
    }
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
