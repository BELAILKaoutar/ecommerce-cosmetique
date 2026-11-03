import PlaceholderPage from "../components/ui/PlaceholderPage";

export default function Shop() {
  return (
    <PlaceholderPage
      kicker="Boutique"
      title="Nos produits naturels"
      description="Le catalogue sera affiché ici à partir des produits réellement disponibles dans la boutique."
      primaryTo="/panier"
      primaryLabel="Voir le panier"
    />
  );
}
