import { Outlet } from "react-router-dom";
import AnnouncementBar from "./AnnouncementBar";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="flex min-h-svh flex-col bg-cream text-charcoal">
      <a href="#contenu" className="skip-link">
        Aller au contenu
      </a>
      <AnnouncementBar />
      <Navbar />
      <main id="contenu" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
