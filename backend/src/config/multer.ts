import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/products";

    if (req.originalUrl.includes("offer-image")) {
      folder = "uploads/offers";
    }

    if (req.originalUrl.includes("profile-image")) {
      folder = "uploads/profiles";
    }
    if (req.originalUrl.includes("gallery-image")) {
  folder = "uploads/gallery";
}

    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1000000000);

    cb(null, uniqueName + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});