"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import Header from "@/components/layout/Header/Header";
import Navigation from "@/components/pages/dashboard/Navigation/Navigation";
import PlaylistsProvider from "../../../app/(dashboard)/dashboard/context/PlaylistContext";
import axios from "axios";

export default function AppLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isPaidUser, setIsPaidUser] = useState(false);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await axios.get("/api/auth/status", {
          withCredentials: true,
        });
        if (res.status === 200 && res.data?.isPaidUser) {
          setIsPaidUser(true);
        }
      } catch (err) {
        console.error("Error fetching user status:", err);
        setIsPaidUser(false);
      }
    }

    fetchStatus();
  }, []);

  // Show navigation only on dashboard pages
  const showNavigation =
    isPaidUser &&
    (pathname?.startsWith("/dashboard") || pathname === "/account/profile");

  const isDashboard = pathname?.startsWith("/dashboard");

  const content = (
    <>
      <Header />
      <main>{children}</main>
      {showNavigation && <Navigation />}
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </>
  );

  return isDashboard ? (
    <PlaylistsProvider>{content}</PlaylistsProvider>
  ) : (
    content
  );
}
