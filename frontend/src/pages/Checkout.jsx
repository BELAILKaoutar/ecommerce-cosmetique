import PlaceholderPage from "../components/ui/PlaceholderPage";

export default function Checkout() {
  return (
    <PlaceholderPage
      kicker="Commande"
      title="Finaliser votre commande"
      description="Le paiement n’est pas demandé ici. Le formulaire invité et le récapitulatif seront connectés à l’API commandes à l’étape e-commerce."
      primaryTo="/panier"
      primaryLabel="Retour au panier"
    />
  );
}
