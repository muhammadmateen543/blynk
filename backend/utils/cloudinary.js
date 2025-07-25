const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "mobistore",
    allowed_formats: ["jpg", "jpeg", "png", "mp4", "webm"],
    resource_type: "auto",
  },
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };
