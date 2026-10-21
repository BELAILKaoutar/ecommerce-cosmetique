import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API E-commerce Cosmétique",
      version: "1.0.0",
      description:
        "Documentation des API REST du site e-commerce cosmétique",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Serveur local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    tags: [
      { name: "Authentification", description: "Connexion administrateur" },
      { name: "Catégories", description: "Gestion des catégories" },
      { name: "Produits", description: "Gestion des produits" },
      { name: "Services", description: "Consultation des services" },
      { name: "Administration Services", description: "CRUD des services" },
      { name: "Commandes", description: "Gestion des commandes" },
    ],
  },
  apis: ["./src/routes/*.js"],
};

export const swaggerSpec = swaggerJSDoc(options);