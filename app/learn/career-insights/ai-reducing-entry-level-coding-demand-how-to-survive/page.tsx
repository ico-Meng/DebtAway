"use client";
import Link from "next/link";
import styles from "../shared-article.module.css";

const globalReset = `
  html, body {
    height: auto !important; min-height: 100vh !important; width: 100% !important;
    display: block !important; background: #faf9f6 !important;
    background-image: none !important; justify-content: unset !important;
    align-items: unset !important; margin: 0 !important; padding: 0 !important;
  }
  a { font-weight: inherit !important; }
`;

const PATHS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Build & Operate a Product Company",
    desc: "Register a legal entity (Stripe Atlas), ship a product with Claude Code or Cursor, acquire real users, process real payments. This is the most complete form of real-world experience and the fastest path to a compelling résumé.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    ),
    title: "Contribute to Open Source",
    desc: "Meaningful contributions to high-visibility open source projects signal technical credibility to any hiring manager who looks at your GitHub. Pick projects that use your target stack and solve problems you genuinely understand.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
      </svg>
    ),
    title: "Build a Professional Public Profile",
    desc: "Share what you're building on LinkedIn and Twitter/X. Write short posts about technical decisions you've made, problems you've solved, and lessons learned. A consistent professional presence makes you discoverable and signals genuine engagement with your field.",
  },
];

export default function ArticlePage() {
  return (
    <>
      <style>{globalReset}</style>
      <div className={styles.page}>
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

        <main className={styles.main}>
          <article className={styles.article}>

            <div className={styles.meta}>
              <span className={styles.category}>Engineering & AI</span>
              <span className={styles.metaDot} />
              <span className={styles.metaText}>March 1, 2026</span>
              <span className={styles.metaDot} />
              <span className={styles.metaText}>6 min read</span>
            </div>

            <h1 className={styles.title}>
              AI Reducing Some Entry-Level Coding Demand. How to Survive?
            </h1>

            <p className={styles.lead}>
              Yes, AI is genuinely reducing demand for certain entry-level engineering roles. But that's not
              the full picture. Engineering is far larger than code generation — and the engineers who
              understand that distinction will not just survive this shift. They'll accelerate through it.
            </p>

            <div className={styles.heroImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80"
                alt="Code on a screen representing AI-assisted software development"
                className={styles.heroImage}
              />
              <p className={styles.imageCaption}>
                AI writes the code faster. The question is: what does the engineer bring to the table beyond code?
              </p>
            </div>

            <h2 className={styles.h2}>What AI Has Actually Changed</h2>
            <p className={styles.p}>
              Tools like Claude Code, Cursor, and GitHub Copilot have fundamentally changed what a single
              engineer can produce in a day. Boilerplate that took hours now takes minutes. CRUD endpoints
              that required careful manual writing are generated from a description. Unit tests, documentation,
              and routine refactors — compressed dramatically.
            </p>
            <p className={styles.p}>
              Companies that once hired three junior engineers to execute a sprint backlog now hire one mid-level
              engineer with AI in their toolkit. The mechanical, specification-following parts of engineering
              have been automated. And junior roles have historically been disproportionately concentrated in
              exactly that layer of work.
            </p>

            <blockquote className={styles.blockquote}>
              "The engineers who are most at risk are not those who write the least code —
              they're those whose value was <em>only</em> in writing code."
            </blockquote>

            <h2 className={styles.h2}>But Engineering Is Far Bigger Than Coding</h2>
            <p className={styles.p}>
              Here's what AI cannot compress: the decisions that require judgment, context, and human experience.
              Engineering at its highest value is a deeply human discipline, and it encompasses far more than
              implementation:
            </p>
            <ul className={styles.ul}>
              <li><strong>System architecture</strong> — choosing how components connect, where boundaries live, and how systems scale under real load</li>
              <li><strong>Industry domain knowledge</strong> — understanding regulatory constraints, business logic, and the workflows that shape technical decisions</li>
              <li><strong>Cross-functional coordination</strong> — translating between product, design, legal, and engineering; aligning stakeholders with different incentives</li>
              <li><strong>Production judgment</strong> — knowing when a system is actually healthy, when to escalate, when to ship and when to hold</li>
              <li><strong>Team structure and culture</strong> — mentorship, code review, process design, psychological safety, knowledge transfer</li>
              <li><strong>Idea-to-product thinking</strong> — the judgment to determine what's worth building, what to cut, and what the user actually needs</li>
            </ul>
            <p className={styles.p}>
              These dimensions represent where the highest engineering leverage actually lives. They require
              human experience that cannot be prompted into existence. The engineers who develop these
              capabilities — deliberately, early — are exactly the people companies are competing to hire.
            </p>

            <div className={styles.inlineImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&auto=format&fit=crop&q=80"
                alt="Engineering team collaborating on system design and architecture"
                className={styles.inlineImage}
              />
              <p className={styles.imageCaption}>
                System architecture, team collaboration, and production judgment cannot be automated.
              </p>
            </div>

            <h2 className={styles.h2}>Self-Train to a More Senior Mindset — Before You Need It</h2>
            <p className={styles.p}>
              The correct response to a shrinking entry-level market isn't to compete harder for the remaining
              roles. It's to graduate past them. Deliberately.
            </p>
            <p className={styles.p}>
              This means building fluency not just in writing code, but in the decisions around code: when to
              use a relational vs. document database, how to design an API that survives product changes, how
              to architect a service boundary, how to instrument a system for observability. Study distributed
              systems, cloud infrastructure, data modeling, and API design. Read engineering blogs from Stripe,
              Cloudflare, Notion, and Linear — companies known for rigorous technical culture. Practice system
              design questions. Think in trade-offs.
            </p>
            <p className={styles.p}>
              The gap between a junior and mid-level engineer is not years of experience — it's the quality
              of questions you ask before you start building. That's a mindset you can develop now.
            </p>

            <h2 className={styles.h2}>Three Proven Paths to Seniority Without a Corporate Job</h2>

            <div className={styles.pillarsGrid}>
              {PATHS.map((path) => (
                <div key={path.title} className={styles.pillar}>
                  <div className={styles.pillarIcon}>{path.icon}</div>
                  <p className={styles.pillarTitle}>{path.title}</p>
                  <p className={styles.pillarDesc}>{path.desc}</p>
                </div>
              ))}
            </div>

            <p className={styles.p}>
              These paths compound. A founder who documents their technical journey on LinkedIn, contributes
              a small fix to an open source project, and ships a product with real users is not an entry-level
              candidate — even without a single line on a corporate employment history.
            </p>

            <div className={styles.ambitologyBox}>
              <div className={styles.ambitologyBoxHeader}>
                <img src="/images/atg-logo.svg" alt="Ambitology" className={styles.ambitologyLogo} />
                <span className={styles.ambitologyBoxLabel}>How Ambitology Can Help</span>
              </div>
              <p className={styles.ambitologyBoxText}>
                The path to seniority without traditional employment starts with building a structured,
                well-documented picture of your technical depth. That's exactly what Ambitology's{" "}
                <Link href="/dashboard?tab=knowledge" className={styles.ambitologyLink}>
                  Knowledge Base
                </Link>{" "}
                is designed for.
              </p>
              <p className={styles.ambitologyBoxText}>
                As you build projects, contribute to open source, and deepen your architectural thinking,
                document every milestone in your knowledge base: technologies implemented, systems designed,
                architectural decisions made, and outcomes achieved. This structured evidence becomes the
                raw material for a résumé that tells the story of a senior engineer — not a junior who
                coded for a year.
              </p>
              <p className={styles.ambitologyBoxText}>
                When you're ready to apply, the{" "}
                <Link href="/dashboard?tab=resume" className={styles.ambitologyLink}>
                  AI-powered Résumé Builder
                </Link>{" "}
                translates that knowledge base into a targeted, role-specific document in minutes — one
                that positions your experience at the level you've actually reached.
              </p>
            </div>

            <div className={styles.ctaSection}>
              <h3 className={styles.ctaTitle}>Document your depth. Apply with confidence.</h3>
              <p className={styles.ctaDesc}>
                Build your knowledge base, plan your growth path, and generate targeted résumés — all in one place.
              </p>
              <Link href="/dashboard?tab=knowledge" className={styles.ctaButton}>
                Start for Free
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>

          </article>
        </main>

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
