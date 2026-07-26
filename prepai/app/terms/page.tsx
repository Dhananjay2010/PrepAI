import Link from "next/link";

export const metadata = {
  title: "Terms of Service — PrepAI",
  description: "Read the Terms of Service governing your use of the PrepAI application.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-paper text-ink py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8 bg-paper-raised p-8 rounded-xl shadow-[0_4px_24px_-8px_rgba(28,34,48,0.12)]">
        <div>
          <Link href="/" className="text-sm font-mono text-focus hover:underline">
            &larr; Back to PrepAI
          </Link>
          <h1 className="font-display text-3xl font-bold mt-4 text-ink">
            Terms of Service
          </h1>
          <p className="text-sm text-slate mt-1 font-mono">
            Last updated: July 26, 2026
          </p>
        </div>

        <section className="space-y-3 font-body text-slate leading-relaxed text-sm">
          <h2 className="font-display text-lg font-semibold text-ink">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using PrepAI ("Service"), you agree to be bound by these Terms of Service. If you disagree with any portion of these terms, you may not access the Service.
          </p>
        </section>

        <section className="space-y-3 font-body text-slate leading-relaxed text-sm">
          <h2 className="font-display text-lg font-semibold text-ink">
            2. Description of Service
          </h2>
          <p>
            PrepAI is an AI-driven interview preparation platform designed to parse job descriptions and generate relevant technical, system design, behavioral, and domain questions, as well as provide interactive practice evaluations.
          </p>
        </section>

        <section className="space-y-3 font-body text-slate leading-relaxed text-sm">
          <h2 className="font-display text-lg font-semibold text-ink">
            3. Acceptable Use Policy
          </h2>
          <p>You agree not to misuse the Service, including but not limited to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Submitting malicious text intended to perform prompt injection or disrupt AI execution.</li>
            <li>Attempting to bypass daily free usage limits or API rate limiters.</li>
            <li>Reverse engineering, scraping, or reselling Service content or API outputs.</li>
            <li>Submitting content that violates applicable intellectual property or privacy laws.</li>
          </ul>
        </section>

        <section className="space-y-3 font-body text-slate leading-relaxed text-sm">
          <h2 className="font-display text-lg font-semibold text-ink">
            4. Subscriptions, Payments & Renewal
          </h2>
          <p>
            PrepAI offers a Free Tier and a Pro Tier billed at ₹299 per month. Subscriptions automatically renew monthly via Razorpay until cancelled by the user. You may cancel your subscription at any time through your account settings.
          </p>
        </section>

        <section className="space-y-3 font-body text-slate leading-relaxed text-sm">
          <h2 className="font-display text-lg font-semibold text-ink">
            5. Disclaimer of Outcomes & Limitation of Liability
          </h2>
          <p>
            PrepAI provides interview practice and evaluation tools for educational and self-preparation purposes. PrepAI makes no guarantee of job placement, offer success, or specific interview outcomes. The Service is provided "as is" without warranty of any kind.
          </p>
        </section>
      </div>
    </main>
  );
}
