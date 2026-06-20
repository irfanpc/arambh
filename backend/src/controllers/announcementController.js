const pool       = require('../config/db');
const cloudinary = require('../config/cloudinary');

exports.getAll = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM announcements ORDER BY pinned DESC, ann_date DESC'
    );
    res.json(rows);
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM announcements WHERE id = $1', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { title, message, ann_date, status = 'New',
            pinned = false, btn_text, btn_link } = req.body;
    if (!title || !message || !ann_date)
      return res.status(400).json({ error: 'title, message, ann_date required' });

    const imageUrl     = req.file ? req.file.path     : null;
    const cloudinaryId = req.file ? req.file.filename  : null;

    const { rows } = await pool.query(
      `INSERT INTO announcements
         (title, message, ann_date, status, pinned, btn_text, btn_link, image_url, cloudinary_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [title, message, ann_date, status, pinned, btn_text || null,
       btn_link || null, imageUrl, cloudinaryId]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { title, message, ann_date, status, pinned, btn_text, btn_link } = req.body;
    const imageUrl     = req.file ? req.file.path     : undefined;
    const cloudinaryId = req.file ? req.file.filename  : undefined;

    const existing = await pool.query(
      'SELECT * FROM announcements WHERE id=$1', [req.params.id]
    );
    if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });

    const final_image_url     = imageUrl     ?? existing.rows[0].image_url;
    const final_cloudinary_id = cloudinaryId ?? existing.rows[0].cloudinary_id;

    const { rows } = await pool.query(
      `UPDATE announcements SET
         title=$1, message=$2, ann_date=$3, status=$4, pinned=$5,
         btn_text=$6, btn_link=$7, image_url=$8, cloudinary_id=$9
       WHERE id=$10 RETURNING *`,
      [title, message, ann_date, status, pinned, btn_text || null,
       btn_link || null, final_image_url, final_cloudinary_id, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM announcements WHERE id=$1 RETURNING cloudinary_id',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    if (rows[0].cloudinary_id) {
      try { await cloudinary.uploader.destroy(rows[0].cloudinary_id); }
      catch (e) { console.warn('Cloudinary delete warning:', e.message); }
    }
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
