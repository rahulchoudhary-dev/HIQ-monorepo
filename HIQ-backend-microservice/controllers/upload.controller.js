require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

console.log('Bucket:', process.env.S3_BUCKET_NAME);

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function getPresignedUrls(req, res) {
  try {
    const { files } = req.body;

    if (!files || !files.length) {
      return res.status(400).json({ message: 'No files provided' });
    }

    const urls = await Promise.all(
      files.map(async (file) => {
        const Key = `uploads/${Date.now()}-${file.fileName}`;

        const command = new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key,
          ContentType: file.fileType,
        });

        const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 }); // 5 mins
        return {
          fileName: file.fileName,
          key: Key,
          url,
        };
      })
    );

    res.json({ urls });
  } catch (error) {
    console.error('Error generating presigned URLs:', error);
    res.status(500).json({ message: 'Failed to generate pre-signed URLs', error });
  }
}

module.exports = { getPresignedUrls };
