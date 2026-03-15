"use client";

import Link from "next/link";
import styles from "./article.module.css";

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

export default function ArticlePage() {
  return (
    <>
      <style>{globalReset}</style>
      <div className={styles.page}>

        {/* ── Header ── */}
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link href="/" className={styles.logo}>
              <img src="/images/atg-logo.svg" alt="Ambitology" className={styles.logoIcon} />
              Ambitology
            </Link>
            <nav className={styles.breadcrumb}>
              <Link href="/" className={styles.breadcrumbLink}>Home</Link>
              <span className={styles.breadcrumbSep}>/</span>
              <Link href="/learn/career-insights" className={styles.breadcrumbLink}>Career Insights</Link>
              <span className={styles.breadcrumbSep}>/</span>
              <span className={styles.breadcrumbCurrent}>Article</span>
            </nav>
          </div>
        </header>

        {/* ── Article ── */}
        <main className={styles.main}>
          <article className={styles.article}>

            {/* Meta */}
            <div className={styles.meta}>
              <span className={styles.category}>Engineering &amp; AI</span>
              <span className={styles.metaDot} />
              <span className={styles.metaText}>February 17, 2026</span>
              <span className={styles.metaDot} />
              <span className={styles.metaText}>6 min read</span>
            </div>

            {/* Title */}
            <h1 className={styles.title}>
              How to Stay Competitive in the Fast-Moving AI Era as Coding Becomes Automated
            </h1>

            {/* Lead */}
            <p className={styles.lead}>
              AI tools like GitHub Copilot, Cursor, and Claude can now generate production-quality code from a single
              sentence. For engineers who've built careers around syntax and implementation, this shift can feel
              existential. But here's the truth: the engineers who will thrive aren't necessarily the fastest typists
              — they're the ones who understand <em>why</em> the code exists and <em>how</em> the system should be shaped.
            </p>

            {/* Hero Image */}
            <div className={styles.heroImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&auto=format&fit=crop&q=80"
                alt="Neural network representing AI transformation in software engineering"
                className={styles.heroImage}
              />
              <p className={styles.imageCaption}>
                The AI era doesn't eliminate engineering — it elevates it.
              </p>
            </div>

            {/* Section 1 */}
            <h2 className={styles.h2}>The Real Risk: Staying in the Code-Only Mindset</h2>
            <p className={styles.p}>
              If your primary value as an engineer is line-by-line implementation, AI has already caught up. Automated
              code generation excels at writing CRUD endpoints from descriptions, generating unit tests and boilerplate,
              converting pseudocode into working functions, and debugging isolated components.
            </p>
            <p className={styles.p}>
              Engineers who define themselves solely as "code producers" face real pressure. The automation wave will
              compress delivery timelines, reduce headcount for routine tasks, and commoditize the implementation skills
              that once commanded premium salaries. This isn't a distant forecast — it's already reshaping hiring
              decisions at leading tech companies.
            </p>

            <blockquote className={styles.blockquote}>
              "The engineers who will thrive are not those who write the most code, but those who make the best
              decisions about what to build and how."
            </blockquote>

            {/* Section 2 */}
            <h2 className={styles.h2}>Engineering Is Far More Than Code</h2>
            <p className={styles.p}>
              Engineering at its core is problem-solving at the intersection of technology, people, and context. Three
              dimensions of engineering will remain deeply human regardless of how powerful AI becomes:
            </p>

            <div className={styles.pillarsGrid}>
              <div className={styles.pillar}>
                <div className={styles.pillarIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <h3 className={styles.pillarTitle}>System Architecture &amp; Technical Judgment</h3>
                <p className={styles.pillarDesc}>
                  Designing distributed systems requires trade-off reasoning built from experience. Should you use event
                  sourcing here? Is eventual consistency acceptable for this user flow? No prompt can fully encode the
                  organizational constraints, team skills, and future roadmap that inform these decisions.
                </p>
              </div>
              <div className={styles.pillar}>
                <div className={styles.pillarIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className={styles.pillarTitle}>Cross-Functional Collaboration</h3>
                <p className={styles.pillarDesc}>
                  Engineers translate between product vision and technical reality. They navigate stakeholder priorities,
                  communicate risks to non-technical leaders, and align engineering decisions with business strategy.
                  This demands trust, communication skills, and political awareness that AI cannot substitute.
                </p>
              </div>
              <div className={styles.pillar}>
                <div className={styles.pillarIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <h3 className={styles.pillarTitle}>Team Leadership &amp; Culture</h3>
                <p className={styles.pillarDesc}>
                  Senior engineers shape how teams operate — through code reviews, mentoring, architectural standards,
                  and incident response. The human dynamics of a healthy engineering culture — psychological safety,
                  knowledge sharing, accountability — are deeply, irreducibly human.
                </p>
              </div>
            </div>

            {/* Team image */}
            <div className={styles.inlineImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&auto=format&fit=crop&q=80"
                alt="Engineers collaborating on system design"
                className={styles.inlineImage}
              />
              <p className={styles.imageCaption}>
                Collaboration, architecture, and leadership — the dimensions of engineering that AI cannot replicate.
              </p>
            </div>

            {/* Section 3 */}
            <h2 className={styles.h2}>The Forecast: Learning Faster with an Architectural Mindset</h2>
            <p className={styles.p}>
              Here's the opportunity hiding inside the disruption. As AI handles the mechanical parts of coding, it
              frees engineers to invest more energy in higher-order thinking. Professionals who develop an
              <strong> architectural mindset</strong> — thinking in systems, trade-offs, and patterns — will be able to:
            </p>
            <ul className={styles.ul}>
              <li>Absorb new technologies faster because they understand underlying patterns, not just syntax</li>
              <li>Use AI as a force multiplier: specify the intent, review the output, own the decision</li>
              <li>Prototype and validate ideas in hours, shifting value from execution to design</li>
              <li>Communicate with both technical and non-technical stakeholders using systems language</li>
            </ul>
            <p className={styles.p}>
              The next wave of high-value engineers will combine technical fluency with broad system knowledge. They'll
              speak the language of databases, messaging queues, cloud infrastructure, security, and product — without
              being siloed in any single discipline. The T-shaped engineer is becoming the X-shaped engineer: depth plus
              breadth plus collaborative reach.
            </p>

            {/* Section 4 */}
            <h2 className={styles.h2}>Industrial Experience Cannot Be Replicated</h2>
            <p className={styles.p}>
              There's a vast gap between "code that works in isolation" and "systems that work in real enterprise
              environments." Production experience teaches things no tutorial or AI model can replicate:
            </p>
            <ul className={styles.ul}>
              <li>How teams actually handle incident response under pressure — the communication, the triage, the postmortems</li>
              <li>The legacy constraints that make seemingly obvious refactors genuinely risky</li>
              <li>The regulatory requirements, organizational politics, and deployment realities that shape every decision</li>
              <li>The tribal knowledge embedded in undocumented systems and the intuitions built from years of debugging production issues</li>
            </ul>
            <p className={styles.p}>
              AI models are trained on public documentation and sanitized examples. But much of what experienced
              engineers know lives in undocumented workflows, scar tissue from past failures, and judgment forged in
              the heat of real production incidents. This embodied knowledge is a genuine competitive moat.
            </p>

            {/* Section 5 — Ambitology CTA box */}
            <div className={styles.ambitologyBox}>
              <div className={styles.ambitologyBoxHeader}>
                <img src="/images/atg-logo.svg" alt="Ambitology" className={styles.ambitologyLogo} />
                <span className={styles.ambitologyBoxLabel}>How Ambitology Can Help</span>
              </div>
              <p className={styles.ambitologyBoxText}>
                This is exactly what <strong>Ambitology</strong> is built for — helping engineers and professionals
                build a structured, evidence-backed view of their technical identity, rather than a hollow list of
                buzzwords.
              </p>
              <p className={styles.ambitologyBoxText}>
                Ambitology's built-in AI agent and structured technical stack help you map where you are, identify
                where the industry is heading, and build a concrete plan to close the gap. The{" "}
                <Link href="/dashboard?tab=knowledge" className={styles.ambitologyLink}>
                  Knowledge Base
                </Link>{" "}
                organizes your skills, projects, and expertise into a living framework that mirrors how high-performing
                engineers actually grow — not just a résumé, but a strategic asset.
              </p>
              <p className={styles.ambitologyBoxText}>
                Instead of reacting to job postings, you can proactively identify the skills and projects that align
                with where the market is heading — then build resume-ready evidence before you even need it. The{" "}
                <Link href="/dashboard?tab=knowledge" className={styles.ambitologyLink}>
                  Expanding Knowledge Base
                </Link>{" "}
                feature lets you plan your next 6–12 months of growth: the projects to start, the technologies to
                learn, and the experiences to document — all structured so your future résumé writes itself.
              </p>
              <p className={styles.ambitologyBoxText}>
                In an era where coding is automated, your competitive advantage is a well-articulated technical
                identity and a forward-looking learning plan. Ambitology gives you both.
              </p>
            </div>

            {/* Free Start CTA */}
            <div className={styles.ctaSection}>
              <h3 className={styles.ctaTitle}>Ready to stay ahead?</h3>
              <p className={styles.ctaDesc}>
                Build your knowledge base, plan your next career chapter, and let AI work <em>for</em> you — not
                against you.
              </p>
              <Link href="/dashboard?tab=knowledge" className={styles.ctaButton}>
                Start for Free
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>

          </article>
        </main>

        {/* ── Footer ── */}
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <Link href="/" className={styles.footerLogo}>
              <img src="/images/atg-logo.svg" alt="Ambitology" className={styles.logoIcon} />
              Ambitology
            </Link>
            <div className={styles.footerLinks}>
              <Link href="/learn/career-insights" className={styles.footerLink}>Career Insights</Link>
              <Link href="/mission" className={styles.footerLink}>Mission</Link>
              <Link href="/contact" className={styles.footerLink}>Contact</Link>
            </div>
            <p className={styles.footerCopy}>© {new Date().getFullYear()} Ambitology. All rights reserved.</p>
          </div>
        </footer>

      </div>
    </>
  );
}
