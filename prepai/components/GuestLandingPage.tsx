"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { LoginButton } from "@/components/LoginButton";
import { PaywallModal } from "@/components/PaywallModal";
import { JDInput } from "@/components/JDInput";
import { QuestionCard } from "@/components/QuestionCard";

export function GuestLandingPage() {
  const shouldReduceMotion = useReducedMotion();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [activeDemoTab, setActiveDemoTab] = useState<"backend" | "fullstack" | "devops">("backend");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Guest Playground Live Generation State
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);
  const [guestResult, setGuestResult] = useState<{
    role_summary?: string;
    seniority?: string;
    key_skills?: string[];
    topics?: any[];
    questions?: any[];
  } | null>(null);

  async function handleGuestGenerate(dataInput: any) {
    const jobDescription = typeof dataInput === "string" ? dataInput : dataInput.jobDescription;
    const targetCompany = typeof dataInput === "object" ? dataInput.targetCompany : undefined;
    const targetSeniority = typeof dataInput === "object" ? dataInput.targetSeniority : undefined;

    try {
      setGuestLoading(true);
      setGuestError(null);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          targetCompany,
          targetSeniority,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate preview questions.");
      }

      setGuestResult(data);
    } catch (err: any) {
      console.error("Guest playground error:", err);
      setGuestError(err.message || "Failed to generate preview questions. Please try again.");
    } finally {
      setGuestLoading(false);
    }
  }

  const sampleRoles = {
    backend: {
      title: "Senior Backend Engineer",
      seniority: "Senior",
      company: "Meta / Uber Level",
      skills: ["Python", "PostgreSQL", "Redis", "System Design", "Microservices"],
      q1: "How would you architect a rate-limiting middleware handling 50,000 requests/sec with low latency?",
      q2: "Explain PostgreSQL index types and when you choose composite B-Tree over GIN for JSONB payloads.",
      sampleAnswer: "Executive Summary: Use the Strangler Fig pattern combined with dual-writing & Change Data Capture to guarantee zero data loss during microservices DB migration.",
    },
    fullstack: {
      title: "Staff Full Stack Engineer",
      seniority: "Staff",
      company: "Stripe / Airbnb Level",
      skills: ["TypeScript", "Next.js", "React", "Node.js", "GraphQL", "Tailwind CSS"],
      q1: "How do React Server Components (RSC) alter data fetching and security boundaries compared to client hooks?",
      q2: "How do you optimize initial page load performance and web vitals for heavy dashboard applications?",
      sampleAnswer: "Executive Summary: Shift data fetching to server components to eliminate client bundle size, while keeping interactive widgets strictly in client boundaries.",
    },
    devops: {
      title: "DevOps & Infrastructure Lead",
      seniority: "Lead",
      company: "AWS / Google Level",
      skills: ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "Prometheus"],
      q1: "How do you execute a zero-downtime database migration across a distributed Kubernetes cluster?",
      q2: "Describe your strategy for incident response and multi-region failover handling.",
      sampleAnswer: "Executive Summary: Implement multi-region active-passive replication with automated DNS failover and blue-green deployment pipelines.",
    },
  };

  const currentDemo = sampleRoles[activeDemoTab];

  const faqs = [
    {
      q: "Do I need a credit card to sign up for the free tier?",
      a: "No! PrepAI's free tier is 100% free forever with no credit card required. You get 1 full job description session per day (5 questions + 1 precise model answer) completely free.",
    },
    {
      q: "Will my pasted job description be kept private?",
      a: "Yes, 100%. Your job descriptions are encrypted and private to your account. We never publish or index your inputs.",
    },
    {
      q: "How is PrepAI different from generic ChatGPT?",
      a: "Generic AI models give generic interview advice. PrepAI extracts exact tech stack nuances, seniority trade-offs, red flags, and interview-ready spoken outlines specifically tailored for technical engineering roles.",
    },
    {
      q: "What is included in the Pro Subscription?",
      a: "Pro includes 20 questions per job description, unlimited precise model answers, live AI mock interview practice turns with real-time scoring, and question expansion capabilities.",
    },
  ];

  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-mint/30 selection:text-ink pb-20">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-paper-raised/90 backdrop-blur-md border-b border-slate/10 py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-display text-2xl font-bold text-ink">PrepAI</span>
            <span className="font-mono text-xs font-semibold uppercase bg-highlight/20 text-ink px-2 py-0.5 rounded">
              Beta
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8 text-sm font-body text-slate font-medium">
            <a href="#playground" className="hover:text-ink transition-colors font-bold text-focus">
              Instant Playground
            </a>
            <a href="#benefits" className="hover:text-ink transition-colors">
              Benefits
            </a>
            <a href="#demo" className="hover:text-ink transition-colors">
              Live Preview
            </a>
            <a href="#pricing" className="hover:text-ink transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-ink transition-colors">
              FAQ
            </a>
          </div>

          <div className="flex items-center space-x-3">
            <LoginButton />
          </div>
        </div>
      </nav>

      {/* Hero Section & Instant Unauthenticated Playground */}
      <section id="playground" className="relative pt-10 pb-16 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Headlines */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center space-x-2 bg-focus/10 border border-focus/20 px-3.5 py-1.5 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-mint animate-pulse" />
              <span className="font-mono text-xs font-bold text-focus uppercase tracking-wide">
                Session 1 • Instant Playground (No Sign-In Required)
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-ink leading-tight tracking-tight">
              Test your target Job Description right now.
            </h1>

            <p className="font-body text-slate text-base sm:text-lg leading-relaxed">
              Paste any job posting or select a sample preset below to see tailored interview questions, technical trade-offs, and spoken model answers extracted in real-time.
            </p>
          </motion.div>

          {/* Playground JD Input Form */}
          <div className="max-w-4xl mx-auto bg-paper-raised rounded-2xl p-6 sm:p-8 border border-slate/15 shadow-[0_8px_32px_-12px_rgba(28,34,48,0.15)] space-y-6">
            <div className="flex items-center justify-between border-b border-slate/10 pb-3">
              <span className="font-mono text-xs font-bold text-focus uppercase">
                ⚡ Instant Value-First Playground
              </span>
              <span className="font-mono text-xs text-mint font-semibold">
                ✓ No Credit Card • No Sign-up Barrier
              </span>
            </div>

            <JDInput onGenerate={handleGuestGenerate} loading={guestLoading} />

            {guestError && (
              <div className="p-4 bg-coral/10 border border-coral/20 text-coral text-xs rounded-xl font-mono">
                {guestError}
              </div>
            )}
          </div>

          {/* Instant Guest Live Preview Result */}
          {guestResult && !guestLoading && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-6 bg-paper-raised rounded-2xl p-6 sm:p-8 border-2 border-mint/40 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate/10 pb-4">
                <div>
                  <span className="font-mono text-xs font-bold text-focus bg-focus/10 px-2.5 py-1 rounded uppercase">
                    {guestResult.seniority || "Senior Engineer"}
                  </span>
                  <h3 className="font-display text-2xl font-bold text-ink mt-2">
                    {guestResult.role_summary || "Target Role Extraction"}
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs bg-mint/15 text-mint font-bold px-3 py-1.5 rounded-full">
                    ✨ Live AI Playground Output
                  </span>
                </div>
              </div>

              {/* Key Skills Tags */}
              {guestResult.key_skills && guestResult.key_skills.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-slate font-semibold">Extracted Stack:</span>
                  {guestResult.key_skills.map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      className="font-mono text-xs bg-paper text-ink px-2.5 py-1 rounded border border-slate/10"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Question 1 & 2 Interactive Cards */}
              <div className="space-y-4 pt-2">
                <h4 className="font-mono text-xs font-bold text-slate uppercase tracking-wider">
                  Unlocked Tailored Preview Questions (2 of {guestResult.questions?.length || 5})
                </h4>

                {guestResult.questions?.slice(0, 2).map((q: any, idx: number) => (
                  <QuestionCard key={idx} question={q} />
                ))}
              </div>

              {/* Blurred Conversion Lock Banner for Remaining Questions */}
              <div className="relative rounded-2xl border-2 border-dashed border-focus/40 bg-gradient-to-r from-focus/5 via-mint/5 to-highlight/10 p-8 text-center space-y-4 overflow-hidden">
                <div className="max-w-xl mx-auto space-y-2 relative z-10">
                  <span className="font-mono text-xs font-bold uppercase text-focus bg-focus/10 px-3 py-1 rounded-full">
                    🔒 Lock Full 20-Question Session
                  </span>
                  <h4 className="font-display text-2xl font-bold text-ink">
                    Unlock Live AI Mock Practice, PDF Export & All 20 Questions
                  </h4>
                  <p className="font-body text-slate text-xs sm:text-sm">
                    Sign in with Google in 5 seconds (100% Free) to save this prep kit, run spoken voice mocks, and access complete model answers.
                  </p>

                  <div className="pt-3 flex justify-center">
                    <LoginButton label="Sign In with Google (Free) to Unlock →" className="bg-focus text-white font-medium px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm shadow-md" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Target Companies Social Proof Banner */}
      <section className="bg-paper-raised border-y border-slate/10 py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-4 text-center">
          <p className="font-mono text-xs text-slate uppercase font-semibold tracking-wider">
            Engineers preparing for technical interviews at top product companies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 font-display text-lg font-bold text-slate/50">
            <span>Google</span>
            <span>Meta</span>
            <span>Amazon</span>
            <span>Microsoft</span>
            <span>Uber</span>
            <span>Stripe</span>
            <span>Swiggy</span>
            <span>Razorpay</span>
          </div>
        </div>
      </section>

      {/* Social Proof & Metrics Bar */}
      <section className="py-12 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center bg-paper-raised rounded-2xl p-8 border border-slate/10 shadow-sm">
          <div className="space-y-1">
            <p className="font-display text-3xl sm:text-4xl font-bold text-ink">15,000+</p>
            <p className="font-mono text-xs text-slate uppercase">Questions Generated</p>
          </div>
          <div className="space-y-1">
            <p className="font-display text-3xl sm:text-4xl font-bold text-mint">88%</p>
            <p className="font-mono text-xs text-slate uppercase">Offer Conversion Rate</p>
          </div>
          <div className="space-y-1">
            <p className="font-display text-3xl sm:text-4xl font-bold text-focus">4.9 / 5</p>
            <p className="font-mono text-xs text-slate uppercase">Engineer Rating</p>
          </div>
          <div className="space-y-1">
            <p className="font-display text-3xl sm:text-4xl font-bold text-ink">30 Sec</p>
            <p className="font-mono text-xs text-slate uppercase">Average Time To Readiness</p>
          </div>
        </div>
      </section>

      {/* Interactive Product Preview & Demo */}
      <section id="demo" className="py-16 px-4 bg-paper-raised border-y border-slate/10">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="font-mono text-xs font-semibold text-mint uppercase bg-mint/10 px-3 py-1 rounded-full">
              Live Product Demo
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink">
              See how PrepAI transforms a Job Description
            </h2>
            <p className="font-body text-slate text-sm">
              Click a sample role below to see how questions, skill tags, and model answers are parsed instantly.
            </p>
          </div>

          {/* Tab Selector Buttons */}
          <div className="flex justify-center items-center space-x-2">
            {(["backend", "fullstack", "devops"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveDemoTab(tab)}
                className={`font-mono text-xs font-semibold px-4 py-2.5 rounded-lg border transition-all ${
                  activeDemoTab === tab
                    ? "bg-focus text-white border-focus shadow-sm"
                    : "bg-paper text-slate border-slate/20 hover:text-ink"
                }`}
              >
                {sampleRoles[tab].title}
              </button>
            ))}
          </div>

          {/* Live Preview Card */}
          <div className="bg-paper rounded-2xl p-6 sm:p-8 border border-slate/15 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate/10 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-semibold text-focus bg-focus/10 px-2.5 py-1 rounded uppercase">
                    {currentDemo.seniority}
                  </span>
                  <span className="font-mono text-xs text-slate">({currentDemo.company})</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-ink mt-2">
                  {currentDemo.title}
                </h3>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {currentDemo.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-[11px] bg-paper-raised text-ink px-2.5 py-1 rounded border border-slate/10"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-paper-raised p-5 rounded-xl border border-slate/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-focus">Q1 • TECHNICAL</span>
                  <span className="font-mono text-xs text-mint font-semibold">Easy / Medium</span>
                </div>
                <p className="font-body text-sm font-medium text-ink">
                  {currentDemo.q1}
                </p>
              </div>

              <div className="bg-paper-raised p-5 rounded-xl border border-slate/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-focus">Q2 • SYSTEM DESIGN</span>
                  <span className="font-mono text-xs text-coral font-semibold">Hard</span>
                </div>
                <p className="font-body text-sm font-medium text-ink">
                  {currentDemo.q2}
                </p>
              </div>

              <div className="bg-paper-raised p-4 rounded-xl border border-mint/30 space-y-1">
                <span className="font-mono text-[11px] font-bold text-mint uppercase">
                  ✨ Gemini Model Answer Sample
                </span>
                <p className="font-body text-xs text-ink/90 italic">
                  "{currentDemo.sampleAnswer}"
                </p>
              </div>
            </div>

            {/* Conversion Lock Banner */}
            <div className="bg-gradient-to-r from-focus/10 via-mint/10 to-highlight/15 p-4 rounded-xl border border-focus/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left space-y-0.5">
                <p className="font-mono text-xs font-bold text-ink">
                  ✨ Unlock All 5 Questions + Full Spoken Model Answers
                </p>
                <p className="text-xs text-slate font-body">
                  Sign in with Google in 5 seconds to generate questions for your target job description.
                </p>
              </div>
              <LoginButton label="Sign In Free to Unlock →" className="bg-focus text-white font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-xs whitespace-nowrap shadow-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* Core Benefits Section */}
      <section id="benefits" className="py-20 px-4 max-w-6xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="font-mono text-xs font-semibold text-focus uppercase bg-focus/10 px-3 py-1 rounded-full">
            Why PrepAI Works
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink">
            Everything you need to ace your next technical role.
          </h2>
          <p className="font-body text-slate text-base">
            Generic question banks don't prepare you for real interviews. PrepAI targets the specific requirements in your actual target job description.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-paper-raised rounded-2xl p-8 border border-slate/10 shadow-sm space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-focus/10 text-focus flex items-center justify-center text-2xl font-bold">
              🎯
            </div>
            <h3 className="font-display text-xl font-bold text-ink">
              Job-Specific Question Accuracy
            </h3>
            <p className="font-body text-slate text-sm leading-relaxed">
              Every question is extracted straight from the tech stack, frameworks, and seniority requirements listed in your job description.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-paper-raised rounded-2xl p-8 border border-slate/10 shadow-sm space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-mint/10 text-mint flex items-center justify-center text-2xl font-bold">
              ⏱️
            </div>
            <h3 className="font-display text-xl font-bold text-ink">
              Zero Prep Fatigue
            </h3>
            <p className="font-body text-slate text-sm leading-relaxed">
              Skip 10+ hours of researching random LeetCode problems or unverified Glassdoor posts. Focus strictly on what matters.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-paper-raised rounded-2xl p-8 border border-slate/10 shadow-sm space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-highlight/20 text-ink flex items-center justify-center text-2xl font-bold">
              🗣️
            </div>
            <h3 className="font-display text-xl font-bold text-ink">
              Spoken-Ready Precise Model Answers
            </h3>
            <p className="font-body text-slate text-sm leading-relaxed">
              Get concise, 150-word executive model answers formatted with clear key talking points ready to speak verbatim in your interview.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-paper-raised rounded-2xl p-8 border border-slate/10 shadow-sm space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-coral/10 text-coral flex items-center justify-center text-2xl font-bold">
              🎙️
            </div>
            <h3 className="font-display text-xl font-bold text-ink">
              Interactive AI Mock Practice Mode
            </h3>
            <p className="font-body text-slate text-sm leading-relaxed">
              Conduct live turn-by-turn practice interviews with instant scoring out of 10, key strengths, missing gaps, and sample verbal answers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Candidate Testimonials */}
      <section className="py-16 px-4 bg-paper-raised border-y border-slate/10">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="font-mono text-xs font-semibold text-focus uppercase">Real Candidate Outcomes</span>
            <h2 className="font-display text-3xl font-bold text-ink">Tested by senior engineers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-paper p-6 rounded-xl border border-slate/10 space-y-3">
              <div className="flex items-center space-x-1 text-highlight text-sm">★★★★★</div>
              <p className="text-sm text-ink font-body italic leading-relaxed">
                "PrepAI predicted 3 out of 4 System Design questions I faced for Meta E5. The model answer outlines saved me at least 15 hours of manual research."
              </p>
              <div className="font-mono text-xs text-slate">
                — Senior Backend Engineer @ Meta Candidate
              </div>
            </div>

            <div className="bg-paper p-6 rounded-xl border border-slate/10 space-y-3">
              <div className="flex items-center space-x-1 text-highlight text-sm">★★★★★</div>
              <p className="text-sm text-ink font-body italic leading-relaxed">
                "The spoken-ready precise answer button is unbelievable. I knew exactly how to phrase my answers without sounding robotic."
              </p>
              <div className="font-mono text-xs text-slate">
                — Staff Full Stack Developer @ Startup
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & Free Trial Comparison Band */}
      <section id="pricing" className="py-20 px-4 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="font-mono text-xs font-semibold text-focus uppercase bg-focus/10 px-3 py-1 rounded-full">
            Simple Transparent Pricing
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink">
            Start Free. Upgrade when you're ready.
          </h2>
          <p className="font-body text-slate text-sm">
            No credit card required to try your first job description.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Free Tier Card */}
          <div className="bg-paper-raised rounded-2xl p-8 border border-slate/15 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs font-semibold text-slate uppercase">
                  Free Starter
                </span>
                <p className="font-display text-4xl font-bold text-ink">$0</p>
                <p className="text-xs text-slate font-body">No credit card required</p>
              </div>

              <ul className="space-y-3 text-sm font-body text-slate">
                <li className="flex items-center space-x-2">
                  <span className="text-mint font-bold">✓</span>
                  <span>1 Free Session per Day (5 Questions)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-mint font-bold">✓</span>
                  <span>1 Free Precise Model Answer</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-mint font-bold">✓</span>
                  <span>Practice Streak & Interview Countdown</span>
                </li>
              </ul>
            </div>

            <LoginButton label="Start Free Trial Now" className="w-full border border-slate/20 bg-paper text-ink font-medium py-3 rounded-xl hover:bg-paper/80 transition-colors text-sm" />
          </div>

          {/* Pro Subscription Card */}
          <div className="bg-paper-raised rounded-2xl p-8 border-2 border-mint shadow-xl space-y-6 flex flex-col justify-between relative">
            <div className="absolute -top-3.5 right-6 bg-mint text-white font-mono text-[10px] font-bold uppercase px-3 py-1 rounded-full">
              Most Popular
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs font-semibold text-mint uppercase">
                  PrepAI Pro Subscription
                </span>
                <div className="flex items-baseline space-x-1">
                  <p className="font-display text-4xl font-bold text-ink">$19</p>
                  <span className="text-xs text-slate font-mono">/ month (or ₹499/mo)</span>
                </div>
                <p className="text-xs text-slate font-body">Unlimited interview preparation</p>
              </div>

              <ul className="space-y-3 text-sm font-body text-ink">
                <li className="flex items-center space-x-2">
                  <span className="text-mint font-bold">✓</span>
                  <span className="font-medium">20 Questions per Job Description</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-mint font-bold">✓</span>
                  <span className="font-medium">Unlimited Precise Model Answers</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-mint font-bold">✓</span>
                  <span className="font-medium">Live AI Mock Practice Mode (Gemini Pro)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-mint font-bold">✓</span>
                  <span className="font-medium">Question Expansion (Get More Questions)</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setPaywallOpen(true)}
              className="w-full bg-mint text-white font-medium py-3 rounded-xl hover:opacity-90 transition-opacity text-sm shadow-md"
            >
              Subscribe to Pro &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* Candidate FAQ Accordion */}
      <section id="faq" className="py-16 px-4 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="font-mono text-xs font-semibold text-focus uppercase">Frequently Asked Questions</span>
          <h2 className="font-display text-3xl font-bold text-ink">Everything you need to know</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-paper-raised rounded-xl border border-slate/10 overflow-hidden">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full p-5 text-left font-display text-base font-semibold text-ink flex items-center justify-between hover:bg-paper/50 transition-colors"
              >
                <span>{faq.q}</span>
                <span className="font-mono text-sm text-slate">{openFaqIndex === idx ? "−" : "+"}</span>
              </button>
              {openFaqIndex === idx && (
                <div className="p-5 pt-0 text-sm font-body text-slate leading-relaxed border-t border-slate/5 bg-paper/30">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final Conversion CTA Band */}
      <section className="bg-focus text-white py-16 px-4 text-center space-y-6">
        <div className="max-w-3xl mx-auto space-y-3">
          <h2 className="font-display text-3xl sm:text-4xl font-bold">
            Ready to ace your next technical interview?
          </h2>
          <p className="font-body text-white/80 text-base">
            Paste your job description and get targeted questions in less than 30 seconds.
          </p>
        </div>

        <div className="flex justify-center">
          <LoginButton label="Try PrepAI Free Now →" className="bg-white text-focus font-medium px-8 py-4 rounded-xl hover:bg-white/90 transition-colors text-base shadow-lg" />
        </div>
      </section>

      {/* Sticky Bottom Conversion Dock */}
      <div className="fixed bottom-0 inset-x-0 bg-paper-raised/95 backdrop-blur-md border-t border-slate/15 p-3.5 z-40 shadow-[0_-4px_24px_-8px_rgba(28,34,48,0.12)]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center space-x-2 text-xs font-mono text-ink font-semibold">
            <span>🎯 Target Interview Ready:</span>
            <span className="text-slate font-normal">Generate 5 questions for free in 30 seconds</span>
          </div>
          <LoginButton label="Sign In with Google (Free) →" className="bg-focus text-white font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-xs whitespace-nowrap shadow-sm" />
        </div>
      </div>

      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
      />
    </div>
  );
}
