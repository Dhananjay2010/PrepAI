import Link from "next/link";

export const metadata = {
  title: "Refund & Cancellation Policy — PrepAI",
  description: "Learn about PrepAI's subscription cancellation and refund policies.",
};

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-paper text-ink py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8 bg-paper-raised p-8 rounded-xl shadow-[0_4px_24px_-8px_rgba(28,34,48,0.12)]">
        <div>
          <Link href="/" className="text-sm font-mono text-focus hover:underline">
            &larr; Back to PrepAI
          </Link>
          <h1 className="font-display text-3xl font-bold mt-4 text-ink">
            Refund & Cancellation Policy
          </h1>
          <p className="text-sm text-slate mt-1 font-mono">
            Last updated: July 26, 2026
          </p>
        </div>

        <section className="space-y-3 font-body text-slate leading-relaxed text-sm">
          <h2 className="font-display text-lg font-semibold text-ink">
            1. Subscription Cancellation
          </h2>
          <p>
            You may cancel your PrepAI Pro subscription (₹299/month) at any time. Self-serve cancellation is available directly inside your <strong>Account Settings</strong> dashboard.
          </p>
          <p>
            When you cancel your subscription, your cancellation will take effect at the end of your current monthly billing cycle. You will retain full access to Pro features (20 questions per session, session history, and Mock Interview mode) through the remainder of your paid billing period.
          </p>
        </section>

        <section className="space-y-3 font-body text-slate leading-relaxed text-sm">
          <h2 className="font-display text-lg font-semibold text-ink">
            2. Refund Policy
          </h2>
          <p>
            PrepAI operates on a non-refundable basis for partial monthly subscription periods once digital access has been rendered:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Partial Billing Cycles:</strong> No pro-rated refunds or credits are issued for partial billing months upon cancellation.</li>
            <li><strong>Future Cycles:</strong> Upon cancelling your subscription, you will not be billed for any future monthly billing cycles.</li>
            <li><strong>Billing Inquiries:</strong> If you believe you were charged in error due to a technical processing glitch, please contact <span className="font-mono text-ink">support@prepai.com</span> within 7 days of the charge for review.</li>
          </ul>
        </section>

        <section className="space-y-3 font-body text-slate leading-relaxed text-sm">
          <h2 className="font-display text-lg font-semibold text-ink">
            3. Contact Support
          </h2>
          <p>
            For assistance with subscription billing or account management, please reach out to <span className="font-mono text-ink">support@prepai.com</span>.
          </p>
        </section>
      </div>
    </main>
  );
}
