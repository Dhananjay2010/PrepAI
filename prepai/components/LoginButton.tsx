"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";

interface LoginButtonProps {
  label?: string;
  className?: string;
}

export function LoginButton({ label = "Sign in", className }: LoginButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const redirectTo = `${window.location.origin}/dashboard`;
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (authError) throw authError;
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setError(
        err.message ||
          "Google login failed. Ensure Google Provider is enabled in Supabase Dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const redirectTo = `${window.location.origin}/dashboard`;
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (authError) throw authError;

      setMessage("✨ Magic login link sent to your email! Check your inbox.");
    } catch (err: any) {
      console.error("Email Auth error:", err);
      setError(err.message || "Failed to send magic link. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const defaultBtnClass =
    "inline-flex items-center justify-center bg-focus text-white font-medium px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity text-sm shadow-xs";

  const modalContent = showModal ? (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-paper-raised max-w-sm w-full rounded-2xl p-6 shadow-[0_16px_48px_-12px_rgba(28,34,48,0.3)] border border-slate/20 space-y-5 animate-in fade-in zoom-in-95 duration-150 relative z-[100000]">
        <div className="flex items-center justify-between border-b border-slate/10 pb-3">
          <h3 className="font-display text-xl font-bold text-ink">
            Sign in to PrepAI
          </h3>
          <button
            onClick={() => setShowModal(false)}
            className="text-slate hover:text-ink text-2xl font-mono leading-none p-1"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="p-3 bg-coral/10 border border-coral/20 text-coral text-xs rounded-md font-body leading-relaxed">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 bg-mint/10 border border-mint/20 text-mint text-xs rounded-md font-body leading-relaxed">
            {message}
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full border border-slate/20 bg-paper hover:bg-paper/80 text-ink font-medium py-3 px-4 rounded-xl transition-colors text-sm flex items-center justify-center space-x-2.5 shadow-xs disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{loading ? "Connecting..." : "Continue with Google"}</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate/15 w-full" />
          <span className="bg-paper-raised px-2 text-[11px] font-mono text-slate uppercase absolute">
            Or with Email
          </span>
        </div>

        {/* Email Magic Link Form */}
        <form onSubmit={handleEmailLogin} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
            disabled={loading}
            className="w-full bg-paper border border-slate/20 rounded-xl p-3 text-ink font-body text-sm placeholder:text-slate/40 focus:outline-none focus:ring-2 focus:ring-focus/30"
          />
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full bg-focus text-white font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm shadow-sm"
          >
            {loading ? "Sending..." : "Send Magic Link"}
          </button>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={className || defaultBtnClass}
      >
        {label}
      </button>

      {mounted && showModal && createPortal(modalContent, document.body)}
    </>
  );
}
