import { Router } from "express";
import { upload } from "../../config/multer";

const router = Router();

router.post("/product-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No image uploaded",
    });
  }

  return res.json({
    success: true,
    imageUrl: `http://localhost:5000/uploads/products/${req.file.filename}`,
  });
});

router.post("/offer-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No image uploaded",
    });
  }

  return res.json({
    success: true,
    imageUrl: `http://localhost:5000/uploads/offers/${req.file.filename}`,
  });
});

router.post("/profile-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No image uploaded",
    });
  }

  return res.json({
    success: true,
    imageUrl: `http://localhost:5000/uploads/profiles/${req.file.filename}`,
  });
});

router.post("/gallery-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No image uploaded",
    });
  }

  return res.json({
    success: true,
    imageUrl: `http://localhost:5000/uploads/gallery/${req.file.filename}`,
  });
});

export default router;