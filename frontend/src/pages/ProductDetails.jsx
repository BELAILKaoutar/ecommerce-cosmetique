import { useParams } from "react-router-dom";
import PlaceholderPage from "../components/ui/PlaceholderPage";

export default function ProductDetails() {
  const { id } = useParams();

  return (
    <PlaceholderPage
      kicker="Fiche produit"
      title="Détail du produit"
      description={`La fiche complète du produit sera chargée depuis la boutique. Référence : ${id || "—"}.`}
      primaryTo="/boutique"
      primaryLabel="Retour à la boutique"
    />
  );
}
