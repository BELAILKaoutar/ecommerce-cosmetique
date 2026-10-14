
export function errorMiddleware(error, req, res, next) {
  console.error(error);

  if (error.code === "P2002") {
    return res.status(409).json({
      message: "Cette catégorie existe déjà",
    });
  }

  if (error.code === "P2003") {
    return res.status(409).json({
      message: "Cette opération viole une relation existante",
    });
  }

  if (error.code === "P2025") {
    return res.status(404).json({
      message: "Ressource introuvable",
    });
  }

  res.status(error.statusCode || 500).json({
    message:
      error.statusCode && error.statusCode < 500
        ? error.message
        : "Erreur interne du serveur",
  });
}
