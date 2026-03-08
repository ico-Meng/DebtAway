"use client";

import { useEffect } from "react";
import Link from "next/link";
import styles from "./mission.module.css";

const globalReset = `
  html, body {
    height: auto !important;
    min-height: 100vh !important;
    width: 100% !important;
    display: block !important;
    background: #faf9f6 !important;
    background-image: none !important;
    justify-content: unset !important;
    align-items: unset !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  a { font-weight: inherit !important; }
`;

export default function MissionPage() {
  useEffect(() => {
    document.body.classList.add("mission-page");
    return () => document.body.classList.remove("mission-page");
  }, []);

  return (
    <div className={styles.page}>
      <style>{globalReset}</style>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>
            <img src="/images/atg-logo.svg" alt="Ambitology" className={styles.logoIcon} />
            Ambitology
          </Link>
          <Link href="/" className={styles.backLink}>← Back to Home</Link>
        </div>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Our Mission</span>
          <h1 className={styles.heroHeading}>Unlocking Human Potential<br />in the Age of AI</h1>
          <p className={styles.heroSub}>
            We believe every professional deserves a fair shot — powered by intelligence, not luck.
          </p>
        </div>
      </section>

      {/* Mission blocks */}
      <section className={styles.content}>
        <div className={styles.contentInner}>

          {/* Company mission */}
          <div className={styles.block}>
            <div className={styles.blockLabel}>
              <span className={styles.blockDot} />
              Ambit Technology Group
            </div>
            <h2 className={styles.blockHeading}>
              Leveraging AI and real expertise to elevate careers
            </h2>
            <p className={styles.blockBody}>
              At Ambit Technology Group, our mission is to leverage AI and real human experts to unlock the career potential of young professionals in the age of AI. We combine cutting-edge technology with seasoned coaching to bridge the gap between raw talent and market opportunity — giving every candidate the tools, insights, and confidence to compete at the highest level.
            </p>
          </div>

          <div className={styles.divider} />

          {/* Platform mission */}
          <div className={styles.block}>
            <div className={styles.blockLabel}>
              <span className={styles.blockDot} style={{ background: "#6366f1" }} />
              Ambitology Platform
            </div>
            <h2 className={styles.blockHeading}>
              End-to-end AI for the modern technical professional
            </h2>
            <p className={styles.blockBody}>
              Ambitology is an AI platform powered by large language models and agentic AI, built to provide end-to-end career solutions for young professionals and technical workers. We exist to solve a fundamental inefficiency in the recruiting market: talented candidates are constantly undersold, while companies struggle to surface the right people.
            </p>
          </div>

          {/* Pillars grid */}
          <div className={styles.pillarsGrid}>
            <div className={styles.pillar}>
              <div className={styles.pillarIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3 className={styles.pillarTitle}>Represent your true potential</h3>
              <p className={styles.pillarText}>Surface your full experience and skill depth to recruiters and companies — no more being lost in the noise.</p>
            </div>
            <div className={styles.pillar}>
              <div className={styles.pillarIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <h3 className={styles.pillarTitle}>Solve market inefficiency</h3>
              <p className={styles.pillarText}>Bridge the disconnect between candidate quality and recruiter visibility through intelligent, data-driven matching.</p>
            </div>
            <div className={styles.pillar}>
              <div className={styles.pillarIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <h3 className={styles.pillarTitle}>Plan ahead of the curve</h3>
              <p className={styles.pillarText}>Help candidates map and build fast-growing technical skills before the market demands them — staying always one step ahead.</p>
            </div>
            <div className={styles.pillar}>
              <div className={styles.pillarIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className={styles.pillarTitle}>Win the interview</h3>
              <p className={styles.pillarText}>Deliver AI-guided interview preparation and real-time coaching so every candidate can confidently land their dream role.</p>
            </div>
          </div>

          <div className={styles.divider} />

          {/* Closing statement */}
          <div className={styles.closingBlock}>
            <blockquote className={styles.quote}>
              "We don't just help you find a job — we help you become the professional you were always capable of being."
            </blockquote>
            <p className={styles.closingSub}>— Ambit Technology Group</p>
          </div>

        </div>
      </section>

      {/* Why Ambitology is Different */}
      <section className={styles.diffSection}>
        <div className={styles.diffInner}>
          <div className={styles.diffHeader}>
            <span className={styles.diffEyebrow}>Built for the AI Era</span>
            <h2 className={styles.diffHeading}>Why Ambitology is different</h2>
            <p className={styles.diffSub}>
              The rules of career growth have changed. Ambitology is the only platform built for how fast the world actually moves.
            </p>
          </div>
          <div className={styles.diffGrid}>

            <div className={styles.diffCard}>
              <div className={styles.diffCardIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3 className={styles.diffCardTitle}>Skills compound faster than ever</h3>
              <p className={styles.diffCardBody}>In the AI era, technical professionals absorb more tools and frameworks in a single week than they once did in months. Your real capability is growing far ahead of what any static resume can capture.</p>
            </div>

            <div className={styles.diffCard}>
              <div className={styles.diffCardIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                  <path d="M7 8h2M11 8h6M7 11h4M13 11h4" />
                </svg>
              </div>
              <h3 className={styles.diffCardTitle}>Agentic tools raise the ceiling</h3>
              <p className={styles.diffCardBody}>Developers now use AI coding agents to implement complex products at a higher level of abstraction — shipping in days what once took months. Your architectural understanding is your true differentiator.</p>
            </div>

            <div className={styles.diffCard}>
              <div className={styles.diffCardIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
                </svg>
              </div>
              <h3 className={styles.diffCardTitle}>Plan months ahead — not weeks behind</h3>
              <p className={styles.diffCardBody}>The gap between starting your job search and landing an offer can stretch weeks to months. Ambitology lets you plan and document future projects in advance so your profile is always ahead of your search.</p>
            </div>

            <div className={styles.diffCard}>
              <div className={styles.diffCardIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  <line x1="12" y1="7" x2="16" y2="7" />
                  <line x1="12" y1="11" x2="16" y2="11" />
                </svg>
              </div>
              <h3 className={styles.diffCardTitle}>Your full knowledge, ready at interview time</h3>
              <p className={styles.diffCardBody}>Candidates catalogue both established experience and planned future skills. When interview time comes, Ambitology matches everything you know — and everything you will know — to the exact role you're targeting.</p>
            </div>

            <div className={styles.diffCard}>
              <div className={styles.diffCardIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  <polyline points="16 11 18 13 22 9" />
                </svg>
              </div>
              <h3 className={styles.diffCardTitle}>End-to-end AI agent — not just a tool</h3>
              <p className={styles.diffCardBody}>Ambitology is a complete AI agent system guiding you from skill planning to resume crafting, fit analysis, and interview prep — one continuous intelligent loop compounding over your entire job search.</p>
            </div>

            <div className={styles.diffCard}>
              <div className={styles.diffCardIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3 className={styles.diffCardTitle}>Solve the market gap, not just your resume</h3>
              <p className={styles.diffCardBody}>Exceptional candidates are constantly undersold while companies struggle to find the right people. Ambitology closes that gap — ensuring every candidate is represented at their true ceiling, not just their last title.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>&copy; {new Date().getFullYear()} Ambit Technology Group, L.L.C. All rights reserved.</span>
      </footer>
    </div>
  );
}
