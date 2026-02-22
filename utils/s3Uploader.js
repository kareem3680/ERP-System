const { v2: cloudinary } = require("cloudinary");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config({ path: "config.env", quiet: true });

// Initialize Cloudinary once (global client)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload buffer to Cloudinary (Same signature as S3)
 * @param {Buffer} buffer - File buffer
 * @param {String} filename - The filename to save as
 * @param {String} folder - Folder inside Cloudinary
 * @param {String} contentType - MIME type (default: image/jpeg)
 * @returns {String} - Public Cloudinary URL
 */
const uploadToS3 = async (
  buffer,
  filename,
  folder,
  contentType = "image/jpeg",
) => {
  if (!buffer) {
    throw new Error("No file buffer provided");
  }

  const publicId = `${folder}/${uuidv4()}-${filename}`;

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: "auto",
        format: contentType.split("/")[1] || "jpg",
        transformation: [
          { width: 800, height: 600, crop: "limit" },
          { quality: "auto:good" },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    stream.end(buffer);
  });

  return result.secure_url;
};

module.exports = uploadToS3;
