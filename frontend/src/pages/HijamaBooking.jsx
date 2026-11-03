import PlaceholderPage from "../components/ui/PlaceholderPage";

export default function HijamaBooking() {
  return (
    <PlaceholderPage
      kicker="Réservation"
      title="Réserver une séance Hijama"
      description="Le parcours de réservation affichera uniquement les créneaux réellement disponibles. Cette étape n’est pas encore activée."
      primaryTo="/soins"
      primaryLabel="Voir les soins"
    />
  );
}
