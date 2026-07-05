import { Router } from "express";
import jwt from "jsonwebtoken";
import axios from "axios";
import prisma from "../../config/prisma";

const router = Router();

const formatMobile = (mobile: string) => {
  const clean = String(mobile || "").replace(/\D/g, "");
  if (clean.length === 10) return "91" + clean;
  return clean;
};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

router.post("/send", async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: { mobile },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const otp = generateOtp();
    const formattedMobile = formatMobile(mobile);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    await prisma.customerOtp.create({
      data: {
        mobile,
        otp,
        expiresAt,
      },
    });

    const message = `Your STRIDE login OTP is ${otp}. It is valid for 5 minutes.`;

    await axios.get("https://api.msg91.com/api/sendotp.php", {
      params: {
        authkey: process.env.MSG91_AUTH_KEY,
        mobile: formattedMobile,
        message,
        sender: process.env.MSG91_SENDER_ID || "STRIDE",
        otp,
        otp_expiry: 5,
        otp_length: 6,
      },
    });

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.response?.data?.message || error.message,
    });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: "Mobile and OTP are required",
      });
    }

    const record = await prisma.customerOtp.findFirst({
      where: {
        mobile,
        otp,
        verified: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: { mobile },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    await prisma.customerOtp.update({
      where: { id: record.id },
      data: { verified: true },
    });

    const token = jwt.sign(
      {
        id: customer.id,
        name: customer.name,
        mobile: customer.mobile,
        role: "CUSTOMER",
      },
      process.env.JWT_SECRET || "stride_secret",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: customer.id,
          name: customer.name,
          mobile: customer.mobile,
          email: customer.email,
          role: "CUSTOMER",
          customerNumber: customer.customerNumber,
          profileImage: customer.profileImage,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;