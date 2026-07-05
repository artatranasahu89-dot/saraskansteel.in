import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        name: "asc",
      },
    });

    const websiteProducts = products.map((product: any) => {
      return {
        id: product.id,
        name: product.name || "Product",
        sku: product.sku || "",
        description: product.description || "",
        imageUrl:
          product.imageUrl ||
          product.productImage ||
          product.image ||
          product.photo ||
          "",
        categoryName:
          product.categoryName ||
          product.type ||
          "Product",
        stock: product.stock ?? 0,
        unit: product.unit || "",
        isActive: product.isActive ?? true,
      };
    });

    return res.json({
      success: true,
      count: websiteProducts.length,
      data: websiteProducts,
    });
  } catch (error: any) {
    console.log("Website products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load website products",
      error: error?.message || "Unknown error",
    });
  }
});

export default router;