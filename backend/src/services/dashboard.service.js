import prisma from "../config/prisma.js";

export const dashboardService = {
  async getStats() {
    // Récupération concurrente de toutes les métriques réelles
    const [
      orders,
      products,
      categoriesCount,
      appointments,
      recentOrders,
      upcomingAppointments,
    ] = await Promise.all([
      prisma.order.findMany({
        select: {
          id: true,
          status: true,
          total: true,
          createdAt: true,
        },
      }),

      prisma.product.findMany({
        select: {
          id: true,
          name: true,
          stock: true,
          price: true,
          isActive: true,
          categoryId: true,
        },
      }),

      prisma.category.count(),

      prisma.appointment.findMany({
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
      }),

      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
        },
      }),

      prisma.appointment.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          slot: {
            include: {
              service: true,
            },
          },
        },
      }),
    ]);

    // Métriques des commandes
    const ordersStats = {
      total: orders.length,
      pending: orders.filter((o) => o.status === "PENDING").length,
      confirmed: orders.filter((o) => o.status === "CONFIRMED").length,
      shipped: orders.filter((o) => o.status === "SHIPPED").length,
      delivered: orders.filter((o) => o.status === "DELIVERED").length,
      cancelled: orders.filter((o) => o.status === "CANCELLED").length,
      revenue: orders
        .filter((o) => ["CONFIRMED", "SHIPPED", "DELIVERED"].includes(o.status))
        .reduce((sum, o) => sum + Number(o.total || 0), 0),
    };

    // Métriques des produits
    const productsStats = {
      total: products.length,
      outOfStock: products.filter((p) => p.stock === 0).length,
      lowStock: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
      inStock: products.filter((p) => p.stock > 5).length,
      active: products.filter((p) => p.isActive).length,
      inactive: products.filter((p) => !p.isActive).length,
    };

    // Métriques des réservations
    const appointmentsStats = {
      total: appointments.length,
      pending: appointments.filter((a) => a.status === "PENDING").length,
      confirmed: appointments.filter((a) => a.status === "CONFIRMED").length,
      cancelled: appointments.filter((a) => a.status === "CANCELLED").length,
      completed: appointments.filter((a) => a.status === "COMPLETED").length,
    };

    // Graphique : Répartition des statuts de commande
    const ordersDistribution = [
      { status: "PENDING", label: "En attente", count: ordersStats.pending, color: "#f59e0b" },
      { status: "CONFIRMED", label: "Confirmées", count: ordersStats.confirmed, color: "#365b46" },
      { status: "SHIPPED", label: "Expédiées", count: ordersStats.shipped, color: "#3b82f6" },
      { status: "DELIVERED", label: "Livrées", count: ordersStats.delivered, color: "#8fa88a" },
      { status: "CANCELLED", label: "Annulées", count: ordersStats.cancelled, color: "#ef4444" },
    ];

    // Graphique : Santé du stock
    const stockDistribution = [
      { label: "En stock (>5)", count: productsStats.inStock, color: "#365b46" },
      { label: "Stock faible (1-5)", count: productsStats.lowStock, color: "#f59e0b" },
      { label: "Rupture de stock (0)", count: productsStats.outOfStock, color: "#ef4444" },
    ];

    return {
      orders: ordersStats,
      products: productsStats,
      categories: {
        total: categoriesCount,
      },
      appointments: appointmentsStats,
      ordersDistribution,
      stockDistribution,
      recentOrders,
      upcomingAppointments,
    };
  },
};
