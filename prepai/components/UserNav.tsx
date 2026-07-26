"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { LoginButton } from "@/components/LoginButton";

interface UserNavProps {
  user: any;
  profile: any;
  onOpenPaywall?: () => void;
}

export function UserNav({ user, profile, onOpenPaywall }: UserNavProps) {
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    try {
      setSigningOut(true);
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setSigningOut(false);
    }
  }

  if (!user) {
    return <LoginButton />;
  }

  const isPaid = profile?.plan === "paid";

  return (
    <div className="flex items-center space-x-3">
      <Link
        href="/dashboard"
        className="font-body text-sm font-medium text-slate hover:text-ink transition-colors"
      >
        Dashboard
      </Link>

      {!isPaid && onOpenPaywall && (
        <button
          onClick={onOpenPaywall}
          className="bg-mint/15 text-mint font-mono text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-mint/25 transition-colors"
        >
          Upgrade Pro
        </button>
      )}

      {/* User Avatar / Email Pill */}
      <div className="hidden sm:flex items-center space-x-1.5 bg-paper px-2.5 py-1 rounded-md border border-slate/10 text-xs font-mono text-slate">
        <span className="w-2 h-2 rounded-full bg-mint" />
        <span className="max-w-[120px] truncate">{user.email}</span>
      </div>

      {/* Sign Out Button */}
      <button
        onClick={handleSignOut}
        disabled={signingOut}
        title="Sign out of PrepAI"
        className="font-mono text-xs text-slate hover:text-coral border border-slate/20 hover:border-coral/30 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
      >
        {signingOut ? "Signing out..." : "Sign out"}
      </button>
    </div>
  );
}
