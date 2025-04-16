"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import Navigation from "@/components/pages/dashboard/Navigation/Navigation";
import PlaylistsProvider from "../../../app/(dashboard)/dashboard/context/PlaylistContext";
import axios from "axios";

export default function AppLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isPaidUser, setIsPaidUser] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!pathname) return;

    async function fetchPaidStatus() {
      try {
        const res = await fetch("/api/auth/paid-status", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.status === 401) {
          setIsPaidUser(false);
        } else if (res.ok) {
          const data = await res.json();

          setIsPaidUser(Boolean(data.isPaidUser));
        } else {
          console.warn("Unexpected response from /api/auth/paid-status");
          setIsPaidUser(false);
        }
      } catch (err) {
        console.error("❌ Error fetching paid status:", err);
        setIsPaidUser(false);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPaidStatus();
  }, [pathname]);

  const pathnameReady = pathname !== undefined;

  const isDashboard = pathname?.startsWith("/dashboard");
  const isProfile = pathname === "/account/profile";
  const isAuthPage = pathname?.startsWith("/auth");
  const isSubscribePage = pathname === "/dashboard/subscribe";
  const isMarketingPage =
    pathname === "/" ||
    pathname?.startsWith("/about") ||
    pathname?.startsWith("/the-workout");

  // Wait for pathname + loading state to resolve
  if (!pathnameReady || isLoading || isPaidUser === null) {
    return null;
  }

  const showDashboardShell =
    isPaidUser && ((isDashboard && !isSubscribePage) || isProfile);
  const showMarketingShell =
    isAuthPage ||
    isMarketingPage ||
    isSubscribePage ||
    (!isPaidUser && isProfile);

  const shouldWrapInPlaylistProvider = isDashboard || isProfile;

  const layout = (
    <>
      {showMarketingShell && <Header />}
      <main>{children}</main>
      {showDashboardShell && <Navigation />}
      {showMarketingShell && <Footer />}
    </>
  );

  const playlistProviderWrap = isDashboard || isProfile;

  return shouldWrapInPlaylistProvider ? (
    <PlaylistsProvider>{layout}</PlaylistsProvider>
  ) : (
    layout
  );
}
