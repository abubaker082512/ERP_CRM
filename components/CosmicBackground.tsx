"use client";

import { usePathname } from "next/navigation";
import BeraxisCosmicCanvas from "@/components/3d/BeraxisCosmicCanvas";

export default function CosmicBackground() {
  const pathname = usePathname();
  const cleanPath = (pathname || "").toLowerCase().trim();

  // Public marketing, SEO, comparison, legal, and auth pages get the 3D Beraxis Cosmic Particle Galaxy
  // Dashboard & internal workspace modules (/apps, /dashboard, /crm, /accounting, /sales, /inventory, /pos, /settings, /super-admin, etc.) return null
  const isPublicPage = 
    cleanPath === "" ||
    cleanPath === "/" || 
    cleanPath.startsWith("/pricing") || 
    cleanPath.startsWith("/about") || 
    cleanPath.startsWith("/contact") || 
    cleanPath.startsWith("/team") || 
    cleanPath.startsWith("/leads-pool") || 
    cleanPath.startsWith("/lead-pool") || 
    cleanPath.startsWith("/pitch-deck") || 
    cleanPath.startsWith("/presentation") || 
    cleanPath.startsWith("/launch-creatives") || 
    cleanPath.startsWith("/privacy") || 
    cleanPath.startsWith("/terms") || 
    cleanPath.startsWith("/refund") || 
    cleanPath.startsWith("/sla") || 
    cleanPath.startsWith("/security") || 
    cleanPath.startsWith("/cookies") || 
    cleanPath.startsWith("/login") || 
    cleanPath.startsWith("/signup") || 
    cleanPath.startsWith("/forgot-password") || 
    cleanPath.startsWith("/checkout") || 
    cleanPath.startsWith("/affiliates") || 
    cleanPath.startsWith("/referrals") || 
    cleanPath.startsWith("/blog") || 
    cleanPath.startsWith("/compare") || 
    cleanPath.startsWith("/features") || 
    cleanPath.startsWith("/industries") || 
    cleanPath.startsWith("/shop") || 
    cleanPath.startsWith("/meet") || 
    cleanPath.startsWith("/appointments/book") ||
    cleanPath.startsWith("/recruitment/apply");

  if (!isPublicPage) {
    return null;
  }

  return <BeraxisCosmicCanvas />;
}
