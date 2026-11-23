import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/config/prisma.js";

const SALT_ROUNDS = 10;

async function seed() {
  const email = (process.env.ADMIN_EMAIL || "admin@example.com").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin123!";
  const name = process.env.ADMIN_NAME || "Administrateur";

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await prisma.admin.upsert({
    where: { email },
    update: { name },
    create: { email, passwordHash, name },
  });

  console.log(`Admin prêt : ${email}`);
}

seed()
  .catch((error) => {
    console.error("Échec du seed admin", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
