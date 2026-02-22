import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config({ path: "config.env", quiet: true });

// ========================
// Cloudinary Configuration
// ========================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {String} filename - The filename to save as
 * @param {String} folder - Folder inside Cloudinary
 * @param {String} contentType - MIME type (default: image/jpeg)
 * @returns {String} - Public Cloudinary URL
 */
const uploadToCloudinary = async (
  buffer,
  filename,
  folder,
  contentType = "image/jpeg",
) => {
  if (!buffer) {
    throw new Error("No file buffer provided");
  }

  const publicId = `${folder}/${uuidv4()}-${filename}`;

  return new Promise((resolve, reject) => {
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
        resolve(result.secure_url);
      },
    );

    stream.end(buffer);
  });
};

export default uploadToCloudinary;
