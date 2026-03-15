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

const MARKETING_CHANNELS = [
  {
    name: "Product Hunt",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="10 8 16 12 10 16 10 8" />
      </svg>
    ),
    desc: "Launch day exposure to thousands of early adopters and tech enthusiasts actively looking for new tools.",
  },
  {
    name: "Hacker News",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    desc: "\"Show HN\" posts attract high-quality technical feedback and can drive thousands of visits overnight.",
  },
  {
    name: "Reddit",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        <path d="M16 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        <path d="M8.5 16a5.5 5.5 0 0 0 7 0" />
      </svg>
    ),
    desc: "Find subreddits where your exact users live. r/entrepreneur, r/SaaS, and niche communities are goldmines.",
  },
  {
    name: "Twitter / X",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4l16 16M4 20L20 4" />
      </svg>
    ),
    desc: "Build in public. Share weekly progress, what you shipped, what broke, and what users said. Authenticity wins.",
  },
  {
    name: "LinkedIn",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
    desc: "For B2B products, cold outreach via LinkedIn DMs outperforms almost every other channel at early stage.",
  },
  {
    name: "Indie Hackers",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    desc: "The most supportive community for founders building revenue-generating products. Share milestones openly.",
  },
];

const PRICING_MODELS = [
  { name: "Freemium", desc: "Free core, paid power features. Lowers the barrier to first signup and creates natural upgrade paths.", example: "e.g. Notion, Figma" },
  { name: "Monthly SaaS", desc: "Predictable MRR. Even $9–$29/mo converts well when you solve a real, recurring pain.", example: "e.g. $9 / $29 / $79 tiers" },
  { name: "Usage-based", desc: "Charge as users grow. Aligns your revenue with the value customers actually receive.", example: "e.g. per API call, per seat" },
  { name: "One-time fee", desc: "Simpler story, easier sell. Works well for tools, templates, and developer utilities.", example: "e.g. $49 lifetime license" },
];

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
              <span className={styles.category}>Career Strategy</span>
              <span className={styles.metaDot} />
              <span className={styles.metaText}>February 20, 2026</span>
              <span className={styles.metaDot} />
              <span className={styles.metaText}>7 min read</span>
            </div>

            {/* Title */}
            <h1 className={styles.title}>
              Too Few True Entry-Level Openings? Here's the Way Out!
            </h1>

            {/* Lead */}
            <p className={styles.lead}>
              "Entry-level. 3 years of experience required." If you've spent any time job hunting in tech, you've seen
              this contradiction. The traditional on-ramp to a software engineering career is quietly broken — and
              waiting for it to fix itself is not a strategy. Here's a better one.
            </p>

            {/* Hero Image */}
            <div className={styles.heroImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80"
                alt="Laptop open with code — building your own path into tech"
                className={styles.heroImage}
              />
              <p className={styles.imageCaption}>
                The best way into the industry isn't to wait for a door to open — it's to build your own.
              </p>
            </div>

            {/* Section 1 */}
            <h2 className={styles.h2}>The Numbers Are Worse Than You Think</h2>
            <p className={styles.p}>
              The 2022–2024 tech layoff wave eliminated over 400,000 positions across the industry. That talent
              didn't disappear — it flooded the applicant pool. Senior engineers willing to take junior pay now
              compete directly with new graduates for the same roles. Companies responded predictably: they added
              experience requirements to entry-level job descriptions as a screening mechanism, not a genuine standard.
            </p>
            <p className={styles.p}>
              The result is a market where "entry-level" is a label, not a reality. Bootcamp graduates, CS
              degree holders, and self-taught developers spend months submitting hundreds of applications and
              receiving automated rejections. The system isn't broken by accident — it's optimized for companies,
              not for candidates trying to break in.
            </p>

            {/* Section 2 */}
            <h2 className={styles.h2}>The Chicken-and-Egg Trap</h2>
            <p className={styles.p}>
              The core problem is circular: you need experience to get a job, but you need a job to get experience.
              Internships help — but they're limited, competitive, and not available to everyone. Personal projects
              help too, but a GitHub repository full of tutorial clones doesn't move the needle the way real
              professional experience does.
            </p>

            <blockquote className={styles.blockquote}>
              "The question isn't how to find a company that will give you a chance.
              It's how to manufacture your own chance — legally, seriously, and impressively."
            </blockquote>

            {/* Section 3 */}
            <h2 className={styles.h2}>Register a Real Company. Build Real Things.</h2>
            <p className={styles.p}>
              Here's the move almost no one talks about: don't wait for experience — create it yourself. Not as a
              hobby project. As a real, registered, operating business.
            </p>
            <p className={styles.p}>
              Tools like{" "}
              <strong>Stripe Atlas</strong> let you incorporate a Delaware C-Corp for around $500, complete with
              a registered agent, EIN, and a Stripe account ready to accept payments — all in a few days. You
              walk away with a legitimate legal entity. That changes everything about how your work is perceived.
            </p>

            <div className={styles.highlightBox}>
              <div className={styles.highlightBoxIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <p className={styles.highlightBoxText}>
                  <strong>Why a real company matters on a résumé:</strong> "Personal project" signals hobby.
                  "Founder &amp; Engineer, [Your Company], Inc." signals professionalism, accountability,
                  and genuine skin in the game. Hiring managers notice the difference immediately.
                </p>
              </div>
            </div>

            {/* Section 4 */}
            <h2 className={styles.h2}>Ship Fast Using AI-Powered Development Tools</h2>
            <p className={styles.p}>
              In 2025, a solo developer can ship a product that would have taken a team of four in 2020. The
              tools available today make this possible:
            </p>

            <div className={styles.toolsGrid}>
              <div className={styles.toolCard}>
                <span className={styles.toolName}>Claude Code</span>
                <span className={styles.toolDesc}>Autonomous coding agent that writes, debugs, and refactors across your entire codebase. Delegate implementation; own the architecture.</span>
              </div>
              <div className={styles.toolCard}>
                <span className={styles.toolName}>Cursor</span>
                <span className={styles.toolDesc}>AI-augmented IDE that understands your codebase and accelerates everything from boilerplate to complex logic. Code with context, not just autocomplete.</span>
              </div>
              <div className={styles.toolCard}>
                <span className={styles.toolName}>GitHub Copilot</span>
                <span className={styles.toolDesc}>Inline code completion that maintains velocity. Works across languages and frameworks. Reduces cognitive overhead on routine code.</span>
              </div>
            </div>

            <p className={styles.p}>
              Don't build something vague. Solve a specific, real problem in a niche you understand.
              Pick your stack deliberately — choose technologies that appear in job descriptions you actually
              want. Ship a working MVP in 2–4 weeks. Deploy it publicly. The goal isn't perfection; it's
              a live product with real users.
            </p>

            {/* Inline image */}
            <div className={styles.inlineImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=900&auto=format&fit=crop&q=80"
                alt="Startup planning and product strategy"
                className={styles.inlineImage}
              />
              <p className={styles.imageCaption}>
                Solve a real problem, ship it fast, and let the market give you the experience no company would.
              </p>
            </div>

            {/* Section 5 */}
            <h2 className={styles.h2}>Marketing Strategy: Get Real Users</h2>
            <p className={styles.p}>
              A product without users is a prototype, not a product. Getting real users is also the most
              impressive part of the story you'll tell in interviews. Here's where to start:
            </p>

            <div className={styles.marketingGrid}>
              {MARKETING_CHANNELS.map((ch) => (
                <div key={ch.name} className={styles.marketingCard}>
                  <div className={styles.marketingIcon}>{ch.icon}</div>
                  <div className={styles.marketingContent}>
                    <span className={styles.marketingName}>{ch.name}</span>
                    <span className={styles.marketingDesc}>{ch.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <p className={styles.p}>
              Pick two or three channels, not all six. Go deep. Consistency beats scattered effort.
              Document every milestone publicly — first user, first $1 in revenue, first 100 signups.
              These numbers become your interview talking points.
            </p>

            {/* Section 6 */}
            <h2 className={styles.h2}>Pricing: Make It a Real Business</h2>
            <p className={styles.p}>
              Don't give everything away for free. Charging — even a small amount — validates that you're
              solving a real problem and teaches you how to sell, which is a skill most engineers never develop.
            </p>

            <div className={styles.pricingGrid}>
              {PRICING_MODELS.map((m) => (
                <div key={m.name} className={styles.pricingCard}>
                  <span className={styles.pricingName}>{m.name}</span>
                  <span className={styles.pricingDesc}>{m.desc}</span>
                  <span className={styles.pricingExample}>{m.example}</span>
                </div>
              ))}
            </div>

            <p className={styles.p}>
              Even $50 MRR (monthly recurring revenue) is transformative on a résumé. It proves you
              closed real paying customers — something most CS graduates have never done.
            </p>

            {/* Section 7 */}
            <h2 className={styles.h2}>Skip Entry Level. Apply for Mid-Level.</h2>
            <p className={styles.p}>
              After 6–12 months of running a real company — building, shipping, marketing, and supporting
              paying customers — you are not an entry-level candidate. You are a battle-tested engineer who:
            </p>
            <ul className={styles.ul}>
              <li>Founded and operated a real registered business</li>
              <li>Shipped a production product used by real people</li>
              <li>Acquired users, processed payments, and handled customer feedback</li>
              <li>Made architectural decisions independently under real constraints</li>
              <li>Learned marketing, pricing, and customer communication alongside the engineering</li>
            </ul>
            <p className={styles.p}>
              Most hiring managers have never built their own company. When a candidate walks in who has —
              regardless of scale — it signals drive, ownership, and a level of self-sufficiency that's
              genuinely rare. You can legitimately target mid-level roles and frame your startup experience
              as exactly what it is: real-world, production engineering experience.
            </p>
            <p className={styles.p}>
              In the AI era, the speed at which you can learn and ship new technologies is faster than
              ever. Stack your startup with the exact technologies on your target job descriptions: cloud
              infrastructure, CI/CD pipelines, specific databases, API design, observability tooling.
              Every technology you implement for your product is a bullet point you earned under fire.
            </p>

            {/* Section 8 — Ambitology box */}
            <div className={styles.ambitologyBox}>
              <div className={styles.ambitologyBoxHeader}>
                <img src="/images/atg-logo.svg" alt="Ambitology" className={styles.ambitologyLogo} />
                <span className={styles.ambitologyBoxLabel}>How Ambitology Can Help</span>
              </div>
              <p className={styles.ambitologyBoxText}>
                Building a company solo means making a lot of decisions: which technologies to learn, how
                to present your experience, and what skills matter most to the roles you're targeting.
                That's exactly where{" "}
                <strong>Ambitology</strong> fits in.
              </p>
              <p className={styles.ambitologyBoxText}>
                Ambitology's AI agent and structured{" "}
                <Link href="https://ambitology.com/dashboard?tab=knowledge" className={styles.ambitologyLink}>
                  Knowledge Base
                </Link>{" "}
                help you map what you've built and learned into a professional technical profile that
                resonates with recruiters. As you build your startup, document each technology you use,
                each architectural decision you make, and each project milestone you hit — turning
                real work into structured evidence that speaks the language of hiring managers.
              </p>
              <p className={styles.ambitologyBoxText}>
                The{" "}
                <Link href="https://ambitology.com/dashboard?tab=knowledge" className={styles.ambitologyLink}>
                  Expanding Knowledge Base
                </Link>{" "}
                feature lets you plan ahead: identify which technologies to add to your stack next,
                schedule personal projects that fill your skill gaps, and build a résumé that tells a
                coherent, compelling story before you ever apply. Stop reacting to job descriptions —
                start engineering your own career narrative.
              </p>
              <p className={styles.ambitologyBoxText}>
                Don't wait for companies to hand you the experience. Build it, document it, and let
                Ambitology help you present it in a way that gets you hired — at the level you've
                actually earned.
              </p>
            </div>

            {/* Free Start CTA */}
            <div className={styles.ctaSection}>
              <h3 className={styles.ctaTitle}>Stop waiting. Start building.</h3>
              <p className={styles.ctaDesc}>
                Register your company, ship your product, and let Ambitology help you turn that
                experience into the career you deserve.
              </p>
              <Link href="https://ambitology.com/dashboard?tab=knowledge" className={styles.ctaButton}>
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
