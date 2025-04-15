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
    async function fetchStatus() {
      try {
        const res = await fetch("/api/auth/paid-status", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.status === 401) {
          console.log("🔒 Not authenticated – skipping paid check");
          setIsPaidUser(false);
          return;
        }

        if (!res.ok) {
          const text = await res.text(); // helpful for debugging
          throw new Error(`Unexpected response (${res.status}): ${text}`);
        }

        const data = await res.json();
        setIsPaidUser(Boolean(data.isPaidUser));
      } catch (err) {
        console.error("❌ Error fetching user status:", err);
        setIsPaidUser(false);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStatus();
  }, []);

  if (isPaidUser === null) return null;
  if (isLoading) return null;

  const isDashboard = pathname?.startsWith("/dashboard");
  const isProfile = pathname === "/account/profile";
  const isAuthPage = pathname?.startsWith("/auth");

  const isMarketingPage =
    pathname === "/" ||
    pathname?.startsWith("/about") ||
    pathname?.startsWith("/the-workout") ||
    pathname?.startsWith("/shop"); // or whatever your marketing paths are

  const showMarketingShell =
    isMarketingPage || isAuthPage || (!isPaidUser && isProfile);
  const showDashboardShell = isPaidUser && (isDashboard || isProfile);

  const content = (
    <>
      {showMarketingShell && <Header />}
      <main>{children}</main>
      {showDashboardShell && <Navigation key="navigation" />}
      {showMarketingShell && <Footer />}
    </>
  );

  // Wrap in PlaylistsProvider for dashboard or profile page
  const shouldUsePlaylistProvider = isDashboard || isProfile;

  return shouldUsePlaylistProvider ? (
    <PlaylistsProvider>{content}</PlaylistsProvider>
  ) : (
    content
  );
}
