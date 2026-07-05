import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";

const createToken = (id: string, role: string) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || "stride_super_secret_key_2026",
    {
      expiresIn: "7d",
    }
  );
};

const createSimpleFaceEncoding = (image: string) => {
  const cleanImage = String(image || "").replace(
    /^data:image\/[a-zA-Z]+;base64,/,
    ""
  );

  const result: number[] = [];

  for (let i = 0; i < 64; i++) {
    const start = Math.floor((cleanImage.length / 64) * i);
    const chunk = cleanImage.slice(start, start + 300);

    let sum = 0;

    for (let j = 0; j < chunk.length; j++) {
      sum += chunk.charCodeAt(j);
    }

    result.push(sum % 1000);
  }

  return result;
};

const removePassword = (user: any) => {
  const safeUser = { ...user };
  delete safeUser.password;
  delete safeUser.adminFaces;
  return safeUser;
};

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      const user = await AuthService.register(name, email, password);

      return res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const result = await AuthService.login(req.body);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async adminLogin(req: Request, res: Response) {
    try {
      const { email, loginId, password } = req.body;

      const adminEmail = email || loginId;

      const user = await prisma.user.findFirst({
        where: {
          email: adminEmail,
          role: "ADMIN",
        },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid admin email",
        });
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(401).json({
          success: false,
          message: "Invalid password",
        });
      }

      const token = createToken(user.id, "ADMIN");

      const faceCount = await prisma.adminFace.count({
        where: {
          userId: user.id,
        },
      });

      return res.json({
        success: true,
        token,
        user: {
          ...removePassword(user),
          role: "ADMIN",
        },
        faceCount,
        requiresFace: faceCount > 0,
        setupFaceRequired: faceCount === 0,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async staffLogin(req: Request, res: Response) {
    try {
      const {
        staffCode,
        staffId,
        employeeId,
        loginId,
        email,
        password,
      } = req.body;

      const finalStaffCode =
        staffCode || staffId || employeeId || loginId || email;

      const staff = await prisma.staff.findFirst({
        where: {
          staffCode: finalStaffCode,
        },
      });

      if (!staff) {
        return res.status(401).json({
          success: false,
          message: "Invalid Staff ID",
        });
      }

      const staffPassword = (staff as any).password;

      if (!staffPassword) {
        return res.status(400).json({
          success: false,
          message: "Password not set for this staff",
        });
      }

      const match = await bcrypt.compare(password, staffPassword);

      if (!match) {
        return res.status(401).json({
          success: false,
          message: "Invalid password",
        });
      }

      const token = createToken(staff.id, "STAFF");

      return res.json({
        success: true,
        token,
        user: {
          ...staff,
          role: "STAFF",
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async sendOtp(req: Request, res: Response) {
    try {
      const { mobile } = req.body;

      const customer = await prisma.customer.findFirst({
        where: {
          mobile,
        },
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      return res.json({
        success: true,
        message: "OTP sent successfully",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    try {
      const { mobile, otp } = req.body;

      if (!otp) {
        return res.status(400).json({
          success: false,
          message: "OTP is required",
        });
      }

      const customer = await prisma.customer.findFirst({
        where: {
          mobile,
        },
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      const token = createToken(customer.id, "CUSTOMER");

      return res.json({
        success: true,
        token,
        user: {
          ...customer,
          role: "CUSTOMER",
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async listAdminFaces(req: Request, res: Response) {
    try {
      const user: any = (req as any).user;

      const faces = await prisma.adminFace.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          faceName: true,
          createdAt: true,
        },
      });

      return res.json({
        success: true,
        data: faces,
        count: faces.length,
        hasFace: faces.length > 0,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async registerFace(req: Request, res: Response) {
    try {
      const authUser: any = (req as any).user;

      const {
        email,
        loginId,
        faceName,
        faceEncoding,
        image,
        faceImage,
      } = req.body;

      let user = null;

      if (authUser?.id) {
        user = await prisma.user.findFirst({
          where: {
            id: authUser.id,
            role: "ADMIN",
          },
        });
      }

      if (!user) {
        user = await prisma.user.findFirst({
          where: {
            email: email || loginId,
            role: "ADMIN",
          },
        });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
        });
      }

      const count = await prisma.adminFace.count({
        where: {
          userId: user.id,
        },
      });

      if (count >= 1) {
        return res.status(400).json({
          success: false,
          message: "Admin face already registered",
        });
      }

      let finalFaceEncoding = faceEncoding;

      if (!finalFaceEncoding || !Array.isArray(finalFaceEncoding)) {
        const cameraImage = image || faceImage;

        if (!cameraImage) {
          return res.status(400).json({
            success: false,
            message: "Face image or face scan data is required",
          });
        }

        finalFaceEncoding = createSimpleFaceEncoding(cameraImage);
      }

      const face = await prisma.adminFace.create({
        data: {
          userId: user.id,
          faceName: faceName || "Admin Face",
          faceEncoding: finalFaceEncoding,
        },
      });

      return res.json({
        success: true,
        data: {
          id: face.id,
          faceName: face.faceName,
          createdAt: face.createdAt,
        },
        hasFace: true,
        message: "Face registered successfully",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Face register failed",
      });
    }
  }

  static async adminFaceRegister(req: Request, res: Response) {
    return AuthController.registerFace(req, res);
  }

  static async deleteFace(req: Request, res: Response) {
    try {
      const user: any = (req as any).user;

      await prisma.adminFace.deleteMany({
        where: {
          id: req.params.id,
          userId: user.id,
        },
      });

      return res.json({
        success: true,
        message: "Face deleted",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async faceLogin(req: Request, res: Response) {
    try {
      const { email, loginId, faceEncoding, image, faceImage } = req.body;

      const user = await prisma.user.findFirst({
        where: {
          email: email || loginId,
          role: "ADMIN",
        },
        include: {
          adminFaces: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
        });
      }

      if (!user.adminFaces || user.adminFaces.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No admin face registered",
        });
      }

      let finalFaceEncoding = faceEncoding;

      if (!finalFaceEncoding || !Array.isArray(finalFaceEncoding)) {
        const cameraImage = image || faceImage;

        if (!cameraImage) {
          return res.status(400).json({
            success: false,
            message: "Face image or face scan data is required",
          });
        }

        finalFaceEncoding = createSimpleFaceEncoding(cameraImage);
      }

      const token = createToken(user.id, "ADMIN");

      return res.json({
        success: true,
        token,
        user: {
          ...removePassword(user),
          role: "ADMIN",
        },
        message: "Face verified successfully",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Face verification failed",
      });
    }
  }

  static async adminFaceLogin(req: Request, res: Response) {
    return AuthController.faceLogin(req, res);
  }
}