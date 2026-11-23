import prisma from "../config/prisma.js";

export const adminRepository = {
  findByEmail(email) {
    return prisma.admin.findUnique({
      where: { email },
    });
  },

  findById(id) {
    return prisma.admin.findUnique({
      where: { id },
    });
  },
};
