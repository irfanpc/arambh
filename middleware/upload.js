const multer  = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

function makeStorage(folder, allowedFormats = ['jpg','jpeg','png','webp']) {
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `aarambh/${folder}`,
      allowed_formats: allowedFormats,
      resource_type: 'auto',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    },
  });
}

const galleryUpload = multer({
  storage: makeStorage('gallery'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/'))
      return cb(new Error('Only image files allowed'));
    cb(null, true);
  },
});

const announcementUpload = multer({
  storage: makeStorage('announcements'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/'))
      return cb(new Error('Only image files allowed'));
    cb(null, true);
  },
});

const mediaUpload = multer({
  storage: makeStorage('media', ['jpg','jpeg','png','webp','mp4','mp3','wav']),
  limits: { fileSize: 50 * 1024 * 1024 },
});

module.exports = { galleryUpload, announcementUpload, mediaUpload };
