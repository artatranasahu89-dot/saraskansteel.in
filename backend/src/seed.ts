import bcrypt from "bcrypt";
import prisma from "./config/prisma";

async function main() {
  const password = await bcrypt.hash("Admin@123", 10);

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@stride.com",
    },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@stride.com",
      password,
      role: "ADMIN",
    },
  });

  console.log("Admin created:", admin.email);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });