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
    imageUrl: `https://saraskansteel-in.onrender.com/uploads/products/${req.file.filename}`,
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
    imageUrl: `https://saraskansteel-in.onrender.com/uploads/offers/${req.file.filename}`,
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
    imageUrl: `https://saraskansteel-in.onrender.com/uploads/profiles/${req.file.filename}`,
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
    imageUrl: `https://saraskansteel-in.onrender.com/uploads/gallery/${req.file.filename}`,
  });
});

export default router;