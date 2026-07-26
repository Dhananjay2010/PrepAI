"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export function Footer() {
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsGuest(!user);
    }
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsGuest(!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <footer
      className={`bg-paper-raised border-t border-slate/10 py-8 px-4 mt-auto text-sm text-slate ${
        isGuest ? "pb-24" : "pb-8"
      }`}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-body">
          &copy; {new Date().getFullYear()} PrepAI. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-mono text-xs">
          <Link href="/privacy" className="hover:text-ink transition-colors">
            Privacy Policy
          </Link>
          <span className="text-slate/30">•</span>
          <Link href="/terms" className="hover:text-ink transition-colors">
            Terms of Service
          </Link>
          <span className="text-slate/30">•</span>
          <Link href="/refund-policy" className="hover:text-ink transition-colors">
            Refund Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
