const mongoose = require("mongoose");

const landSchema = new mongoose.Schema({
  ownerName: { type: String, required: true },
  landSize: { type: Number, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  contact: { type: String, required: true }, // Owner's contact info
  description: { type: String, required: true },
  imagePath: { type: String, required: false }, // Stores the image path
  createdAt: { type: Date, default: Date.now } // Timestamp
});

const Land = mongoose.model("Land", landSchema);

const multer = require("multer");

// Configure storage for uploaded images
const storage = multer.diskStorage({
  destination: "public/uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });
module.exports = Land;




