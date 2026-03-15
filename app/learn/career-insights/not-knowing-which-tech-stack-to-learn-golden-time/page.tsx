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

const TECH_AREAS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    name: "Frontend & Full-Stack",
    desc: "React, Next.js, TypeScript. High demand, visible output, great for product-minded engineers. Pairs with any backend.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
      </svg>
    ),
    name: "Backend & APIs",
    desc: "Python/FastAPI, Node.js, Go. System design, scalability thinking, and data modeling live here. High leverage in AI-era products.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    name: "Cloud & Infrastructure",
    desc: "AWS, GCP, Terraform, Docker, Kubernetes. Companies need engineers who can ship and operate — not just code. Excellent salary trajectory.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/><path d="M16 2l4 4-4 4"/>
      </svg>
    ),
    name: "AI & Machine Learning",
    desc: "LLM integration, vector databases, RAG pipelines, fine-tuning. The fastest-growing demand area in the market right now.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    name: "Security & DevOps",
    desc: "CI/CD, security engineering, observability, incident response. High-trust, high-responsibility roles with strong compensation.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    name: "Data Engineering",
    desc: "Pipelines, warehouses, ETL/ELT, analytics. Every company runs on data decisions. Data engineering is a foundation skill for AI-era products.",
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
              <span className={styles.category}>Learning & Growth</span>
              <span className={styles.metaDot} />
              <span className={styles.metaText}>February 23, 2026</span>
              <span className={styles.metaDot} />
              <span className={styles.metaText}>5 min read</span>
            </div>

            <h1 className={styles.title}>
              Not Knowing Which Tech Stack to Learn? Now It Is Your Golden Time!
            </h1>

            <p className={styles.lead}>
              If you're unsure which technology to specialize in, you might be positioned better than you think.
              In the AI era, broad architectural awareness — knowing a little about a lot — is no longer a
              weakness. It's the foundation of a genuinely rare and high-value engineering mindset.
            </p>

            <div className={styles.heroImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80"
                alt="Engineer exploring multiple technologies and frameworks on a laptop"
                className={styles.heroImage}
              />
              <p className={styles.imageCaption}>
                In the AI age, knowing the landscape matters more than memorizing one corner of it.
              </p>
            </div>

            <h2 className={styles.h2}>Uncertainty Means Breadth — and Breadth Is a Superpower Now</h2>
            <p className={styles.p}>
              If you're asking "which tech stack should I learn?", you're almost certainly someone who has
              touched multiple areas of software: a bit of frontend, some backend, some cloud concepts, maybe
              a little data work. You haven't gone deep on any single thing, but you recognize the landscape.
              That cross-domain awareness is exactly what's becoming rare and valuable.
            </p>
            <p className={styles.p}>
              For most of software engineering's history, the path to seniority ran through deep specialization.
              You became "the React expert" or "the Postgres person" or "the Kubernetes engineer." Depth in a
              narrow domain was the primary signal of expertise.
            </p>
            <p className={styles.p}>
              AI coding tools are dismantling that equation. The things that required deep expertise to implement
              correctly — boilerplate, configuration, language syntax, routine algorithms — are increasingly
              generated. What's left irreducibly human is judgment: where to draw system boundaries, how to
              model data, what to optimize for, when to accept technical debt. That judgment requires breadth.
            </p>

            <blockquote className={styles.blockquote}>
              "The most valuable engineers in the AI era aren't the ones who know a single stack the deepest.
              They're the ones who know enough about everything to direct AI effectively — and own the decisions
              that AI cannot make."
            </blockquote>

            <h2 className={styles.h2}>Know Yourself First — Then Pick a Direction</h2>
            <p className={styles.p}>
              Before choosing what to learn, invest 30 minutes answering three honest questions:
            </p>
            <ul className={styles.ul}>
              <li><strong>What kind of problems energize you?</strong> User-facing products (frontend, mobile), behind-the-scenes infrastructure (backend, cloud, data), or the full picture (full-stack, platform engineering)?</li>
              <li><strong>What industries are you drawn to?</strong> FinTech, HealthTech, DevTools, Climate, Gaming, Enterprise SaaS? Different sectors weight different stacks differently.</li>
              <li><strong>What does the market around you reward?</strong> Look at 20–30 job descriptions in your target area and note which technologies appear most frequently — not as a prescriptive list, but as a market signal.</li>
            </ul>
            <p className={styles.p}>
              You don't need a single, permanent answer. You need a direction: backend-leaning, frontend-focused,
              full-stack generalist, data engineering, or cloud/platform. Once you have a direction, choose two
              or three core technologies in that space and go deep enough to build real things with them.
            </p>

            <h2 className={styles.h2}>Your Golden Time: Six Paths Worth Exploring</h2>
            <p className={styles.p}>
              In the current market, each of these areas offers strong demand, compelling career trajectories,
              and meaningful leverage when combined with AI tooling. Pick a direction, not a destination:
            </p>

            <div className={styles.techGrid}>
              {TECH_AREAS.map((area) => (
                <div key={area.name} className={styles.techCard}>
                  <div className={styles.techIcon}>{area.icon}</div>
                  <div className={styles.techContent}>
                    <span className={styles.techName}>{area.name}</span>
                    <span className={styles.techDesc}>{area.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.inlineImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=900&auto=format&fit=crop&q=80"
                alt="Engineer building a project that spans multiple technologies"
                className={styles.inlineImage}
              />
              <p className={styles.imageCaption}>
                Building a project that spans frontend, backend, and deployment teaches more than any single-tool tutorial.
              </p>
            </div>

            <h2 className={styles.h2}>Learn Tools, Build Projects, Demonstrate Systems Thinking</h2>
            <p className={styles.p}>
              Here's the most important realization: in the AI era, you don't need to master every edge case
              or configuration detail before you can build with a technology. You need to understand the
              patterns well enough to direct AI tools effectively and evaluate their output critically.
            </p>
            <p className={styles.p}>
              The best possible way to prove you've learned a tech stack isn't a certificate or a tutorial
              completion badge. It's a complete project that integrates multiple technologies and makes
              real architectural choices. A full-stack application with a database, a REST or GraphQL API,
              a frontend, and a CI/CD deployment pipeline tells a hiring manager more than any list of
              technologies on a résumé.
            </p>
            <p className={styles.p}>
              Use Claude Code or Cursor to accelerate implementation. Let AI handle the boilerplate. Focus
              your deliberate energy on the decisions that require judgment: database schema design, API
              contract structure, state management approach, error boundary strategy, deployment architecture.
              Those are the decisions that appear in technical interviews — and they're the ones only you can make.
            </p>

            <div className={styles.highlightBox}>
              <div className={styles.highlightBoxIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <p className={styles.highlightBoxText}>
                <strong>The compound effect:</strong> A broad engineer who learns three or four stacks at a
                working level — and can ship across them using AI tools — becomes more productive than a
                narrow specialist within 12–18 months. Each new technology you touch makes the next one faster
                to learn, because patterns repeat across stacks. This is the architectural mindset compounding.
              </p>
            </div>

            <h2 className={styles.h2}>Showcase Scope — Not Just Syntax</h2>
            <p className={styles.p}>
              When you apply for roles, the question interviewers are asking isn't "does this person know
              every API in this framework?" It's "can this person figure things out, make sound decisions,
              and ship something that works in a real environment?" Your goal is to demonstrate all three.
            </p>
            <p className={styles.p}>
              Build one project that's genuinely complex — not a tutorial clone, but something that involves
              authentication, a real data model, external API integrations, deployment, and user-facing UX.
              Then document the architectural decisions you made and why. In interviews, talk about trade-offs:
              why you chose PostgreSQL over MongoDB, why you structured the API the way you did, what you'd
              do differently knowing what you know now. That conversation is what separates a strong candidate
              from a forgettable one.
            </p>

            <div className={styles.ambitologyBox}>
              <div className={styles.ambitologyBoxHeader}>
                <img src="/images/atg-logo.svg" alt="Ambitology" className={styles.ambitologyLogo} />
                <span className={styles.ambitologyBoxLabel}>How Ambitology Can Help</span>
              </div>
              <p className={styles.ambitologyBoxText}>
                Choosing what to learn next is easier when you have a clear map of what you already know —
                and a structured view of where the market is heading. That's exactly what Ambitology's{" "}
                <Link href="https://ambitology.com/dashboard?tab=knowledge" className={styles.ambitologyLink}>
                  Knowledge Base
                </Link>{" "}
                is designed to provide.
              </p>
              <p className={styles.ambitologyBoxText}>
                As you explore new tools and build projects, document everything in your knowledge base:
                technologies you've implemented, architectural decisions you've made, and projects you've
                shipped. The AI agent helps you identify patterns in your learning, suggests adjacent
                technologies worth exploring based on your direction, and structures your experience into
                a coherent technical narrative.
              </p>
              <p className={styles.ambitologyBoxText}>
                Over time, your knowledge base becomes a strategic asset — a living map of your capabilities
                that makes it easy to see exactly where to invest your learning energy next, and equally easy
                to generate a{" "}
                <Link href="https://ambitology.com/dashboard?tab=resume" className={styles.ambitologyLink}>
                  targeted résumé
                </Link>{" "}
                that tells the story of an engineer with real architectural breadth and hands-on depth.
              </p>
            </div>

            <div className={styles.ctaSection}>
              <h3 className={styles.ctaTitle}>Map what you know. Plan what's next.</h3>
              <p className={styles.ctaDesc}>
                Your broad perspective is an advantage in the AI era. Let Ambitology help you build on it strategically.
              </p>
              <Link href="https://ambitology.com/dashboard?tab=knowledge" className={styles.ctaButton}>
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
