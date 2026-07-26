import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — PrepAI",
  description: "Learn how PrepAI collects, processes, and protects your personal data and job descriptions.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-paper text-ink py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8 bg-paper-raised p-8 rounded-xl shadow-[0_4px_24px_-8px_rgba(28,34,48,0.12)]">
        <div>
          <Link href="/" className="text-sm font-mono text-focus hover:underline">
            &larr; Back to PrepAI
          </Link>
          <h1 className="font-display text-3xl font-bold mt-4 text-ink">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate mt-1 font-mono">
            Last updated: July 26, 2026
          </p>
        </div>

        <section className="space-y-3 font-body text-slate leading-relaxed text-sm">
          <h2 className="font-display text-lg font-semibold text-ink">
            1. Information We Collect
          </h2>
          <p>
            When you use PrepAI, we collect minimal information necessary to deliver interview preparation services:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account Information:</strong> Email address provided during authentication (via Google OAuth or Email Sign-in).</li>
            <li><strong>Job Description Input:</strong> Text content you paste into PrepAI to generate tailored interview questions and mock interviews.</li>
            <li><strong>Prep Session History:</strong> Generated questions, role summaries, readiness scores, and mock interview practice turns associated with your account.</li>
            <li><strong>Payment Metadata:</strong> Transaction reference IDs and subscription status provided by Razorpay (we do not handle raw payment card numbers).</li>
          </ul>
        </section>

        <section className="space-y-3 font-body text-slate leading-relaxed text-sm">
          <h2 className="font-display text-lg font-semibold text-ink">
            2. Third-Party AI Data Processing (Google Gemini API)
          </h2>
          <p>
            To extract interview questions and analyze job postings, job description text submitted to PrepAI is transmitted securely to <strong>Google Gemini API</strong> (operated by Google LLC) as a third-party data subprocessor.
          </p>
          <p>
            Data sent to the Google Gemini API is transmitted strictly for dynamic content evaluation. We enforce system prompt isolation boundaries to ensure your input is treated as raw analysis data.
          </p>
        </section>

        <section className="space-y-3 font-body text-slate leading-relaxed text-sm">
          <h2 className="font-display text-lg font-semibold text-ink">
            3. Payment Processing via Razorpay
          </h2>
          <p>
            All paid subscription orders and renewals are processed securely via <strong>Razorpay Software Private Limited</strong>. Your financial credentials (credit/debit cards, UPI handles, net banking credentials) are processed directly by Razorpay in compliance with PCI-DSS standards and are never stored on PrepAI servers.
          </p>
        </section>

        <section className="space-y-3 font-body text-slate leading-relaxed text-sm">
          <h2 className="font-display text-lg font-semibold text-ink">
            4. Data Retention & Your Deletion Rights
          </h2>
          <p>
            We retain session records and account profiles while your account remains active. Recognizing that job descriptions may contain proprietary employer details, you may request full deletion of your session history and account profile at any time by accessing account settings or contacting support.
          </p>
        </section>

        <section className="space-y-3 font-body text-slate leading-relaxed text-sm">
          <h2 className="font-display text-lg font-semibold text-ink">
            5. Contact Us
          </h2>
          <p>
            If you have questions about this Privacy Policy or your personal data, please contact us at <span className="font-mono text-ink">support@prepai.com</span>.
          </p>
        </section>
      </div>
    </main>
  );
}
