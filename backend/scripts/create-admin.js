
import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/config/prisma.js";

async function createAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME?.trim() || null;

    if (!email || !password || password.length < 12) {
      throw new Error(
        "Définis ADMIN_EMAIL et ADMIN_PASSWORD (12 caractères minimum) dans .env"
      );
    }

    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log("Un administrateur avec cet email existe déjà.");
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.admin.create({
      data: {
        email,
        name,
        passwordHash,
      },
    });

    console.log("Administrateur créé avec succès !");
    console.log("ID :", admin.id);
    console.log("Email :", admin.email);
  } catch (error) {
    console.error("Erreur :", error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
