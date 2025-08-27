const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

// Initialize once (global client)
const s3 = new S3Client({ region: process.env.AWS_REGION });

/**
 * Upload buffer to AWS S3
 * @param {Buffer} buffer - File buffer
 * @param {String} filename - The filename to save as
 * @param {String} folder - Folder inside the bucket
 * @param {String} contentType - MIME type (default: image/jpeg)
 * @returns {String} - Public S3 URL
 */
const uploadToS3 = async (
  buffer,
  filename,
  folder,
  contentType = "image/jpeg"
) => {
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${folder}/${filename}`,
    Body: buffer,
    ContentType: contentType,
  };

  await s3.send(new PutObjectCommand(uploadParams));

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${folder}/${filename}`;
};

module.exports = uploadToS3;
