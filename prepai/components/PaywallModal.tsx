"use client";

import { useState } from "react";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export function PaywallModal({ isOpen, onClose, userId }: PaywallModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Suppress paywall modal completely in local development environment!
  if (!isOpen || process.env.NODE_ENV === "development") return null;

  async function handleUpgrade() {
    if (!userId) {
      setError("Please sign in to upgrade to PrepAI Pro.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/razorpay/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const subscription = await res.json();

      if (!res.ok || subscription.error) {
        throw new Error(subscription.error || "Failed to create subscription");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscription.id,
        name: "PrepAI",
        description: "Pro Plan — Monthly Subscription (₹299/mo)",
        theme: { color: "#4C5FD5" },
        handler: function () {
          window.location.href = "/dashboard?upgraded=true";
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("Upgrade error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs">
      <div className="bg-paper-raised max-w-md w-full rounded-xl p-6 shadow-[0_4px_24px_-8px_rgba(28,34,48,0.2)] border border-slate/10 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate/10 pb-4">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-focus bg-focus/10 px-2 py-0.5 rounded">
              PrepAI Pro
            </span>
            <h2 className="font-display text-2xl font-bold text-ink mt-1">
              Unlock Unlimited Practice
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate hover:text-ink text-xl font-mono leading-none p-1"
          >
            &times;
          </button>
        </div>

        <div className="space-y-3 font-body text-slate text-sm">
          <div className="flex items-baseline justify-between text-ink pb-2">
            <span className="text-3xl font-display font-bold">₹299</span>
            <span className="font-mono text-xs text-slate">/ month</span>
          </div>

          <ul className="space-y-2.5 pt-2">
            <li className="flex items-center space-x-2 text-ink">
              <span className="text-mint font-bold">✓</span>
              <span><strong>20 Questions per Session</strong> (vs 5 on Free)</span>
            </li>
            <li className="flex items-center space-x-2 text-ink">
              <span className="text-mint font-bold">✓</span>
              <span><strong>Interactive Mock Interview Mode</strong> (Gemini 2.5 Pro)</span>
            </li>
            <li className="flex items-center space-x-2 text-ink">
              <span className="text-mint font-bold">✓</span>
              <span><strong>Unlimited Daily Generations</strong></span>
            </li>
            <li className="flex items-center space-x-2 text-ink">
              <span className="text-mint font-bold">✓</span>
              <span><strong>Full Session History Dashboard</strong></span>
            </li>
          </ul>
        </div>

        {error && (
          <div className="p-3 bg-coral/10 border border-coral/20 text-coral text-xs rounded-md font-body">
            {error}
          </div>
        )}

        <div className="space-y-2 pt-2">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-focus text-white font-medium py-3 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 text-sm shadow-md"
          >
            {loading ? "Initializing Checkout..." : "Upgrade to Pro — ₹299/mo"}
          </button>
          <p className="text-center font-mono text-[11px] text-slate">
            Cancel anytime in 1-click. Secure checkout via Razorpay.
          </p>
        </div>
      </div>
    </div>
  );
}
