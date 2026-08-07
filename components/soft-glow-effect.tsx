"use client";

import { useEffect } from "react";
import { useLumioStore } from "@/lib/store";
import { useSession } from "next-auth/react";

export function SoftGlowEffect() {
  const { softGlowEnabled, setSoftGlowEnabled } = useLumioStore();
  const { data: session } = useSession();

  // Load user's soft glow preference from profile on login
  useEffect(() => {
    const loadSoftGlowPreference = async () => {
      if (session?.user?.id) {
        try {
          const res = await fetch("/api/user/profile");
          if (res.ok) {
            const data = await res.json();
            const profile = data.profile;
            if (profile && profile.softGlowEnabled !== undefined) {
              setSoftGlowEnabled(profile.softGlowEnabled);
            }
          }
        } catch (error) {
          console.error("Error loading soft glow preference:", error);
        }
      }
    };

    loadSoftGlowPreference();
  }, [session?.user?.id, setSoftGlowEnabled]);

  // Apply/remove CSS class based on state
  useEffect(() => {
    if (softGlowEnabled) {
      document.body.classList.add("soft-glow-active");
    } else {
      document.body.classList.remove("soft-glow-active");
    }
  }, [softGlowEnabled]);

  return null;
}
