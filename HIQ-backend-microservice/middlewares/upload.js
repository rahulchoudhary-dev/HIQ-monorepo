const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const { FILE_SIZE_LIMIT } = require('../constant');
require('dotenv').config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

console.log('🧾 S3 Config ->', {
  region: process.env.AWS_REGION,
  bucket: process.env.S3_BUCKET_NAME,
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: process.env.S3_PUBLIC === 'true' ? 'public-read' : 'private',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      console.log('req', req.body);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = file.originalname.split('.').pop();
      const filename = `attachments/${uniqueSuffix}.${ext}`;
      cb(null, filename);
    },
  }),
  limits: { fileSize: FILE_SIZE_LIMIT },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type. Only JPEG, PNG, and PDF allowed.'));
  },
});

module.exports = upload;
