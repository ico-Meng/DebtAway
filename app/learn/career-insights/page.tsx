"use client";

import Link from "next/link";
import styles from "./career-insights.module.css";

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

const ARTICLES = [
  {
    slug: "broader-stack-vs-deep-specialization-in-the-ai-age",
    title: "Should I Go a Broader Technical Stack or Go In Depth into a Technical Area?",
    excerpt:
      "In the AI era, the answer isn't breadth or depth — it's expand horizontally regardless of where you start. Here's why, and exactly how to do it strategically.",
    category: "Learning & Growth",
    date: "March 10, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop&q=80",
  },
  {
    slug: "how-to-translate-projects-into-resume-bullets",
    title: "Difficulty Translating Projects into Résumé Bullets? Here's How!",
    excerpt:
      "Spent weeks building a project but can't turn it into compelling résumé bullets? There's a four-component formula that solves this for every technical project, every time.",
    category: "Resume & Career",
    date: "March 7, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80",
  },
  {
    slug: "how-to-stand-out-in-an-oversaturated-job-market",
    title: "How to Stand Out in an Oversaturated Job Market with Massive Applicant Competition",
    excerpt:
      "Fewer jobs, more talent, and thousands of applicants per role. Here's a data-backed playbook to rise above the noise — from building real experience to targeting the right companies.",
    category: "Job Search Strategy",
    date: "March 4, 2026",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=80",
  },
  {
    slug: "ai-reducing-entry-level-coding-demand-how-to-survive",
    title: "AI Reducing Some Entry-Level Coding Demand. How to Survive?",
    excerpt:
      "AI tools are genuinely compressing entry-level coding roles. But engineering is far bigger than code — and those who understand that distinction will accelerate, not stall.",
    category: "Engineering & AI",
    date: "March 1, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
  },
  {
    slug: "no-internship-no-credible-signal-heres-the-way-out",
    title: "No Internship, So No Credible Signal. Here's the Way Out!",
    excerpt:
      "Recruiters use internships as a trust proxy. If you don't have one, here's how to manufacture a signal that's even more compelling — starting with hiring yourself.",
    category: "Early Career",
    date: "February 26, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&auto=format&fit=crop&q=80",
  },
  {
    slug: "not-knowing-which-tech-stack-to-learn-golden-time",
    title: "Not Knowing Which Tech Stack to Learn? Now It Is Your Golden Time!",
    excerpt:
      "Unsure which technology to specialize in? In the AI era, broad architectural awareness beats narrow specialization. Your uncertainty might be your greatest strategic advantage.",
    category: "Learning & Growth",
    date: "February 23, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
  },
  {
    slug: "too-few-entry-level-openings-heres-the-way-out",
    title: "Too Few True Entry-Level Openings? Here's the Way Out!",
    excerpt:
      "The entry-level job market is quietly broken. Here's the playbook: register a real company, ship a product with AI tools, land paying users, and walk into interviews as a founder — not a fresh grad.",
    category: "Career Strategy",
    date: "February 20, 2026",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80",
  },
  {
    slug: "how-to-stay-competitive-in-the-fast-moving-ai-era",
    title: "How to Stay Competitive in the Fast-Moving AI Era as Coding Becomes Automated",
    excerpt:
      "AI tools can now write code in seconds. But engineering is far more than typing syntax — and the engineers who understand that will thrive.",
    category: "Engineering & AI",
    date: "February 17, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&auto=format&fit=crop&q=80",
  },
];

export default function CareerInsightsPage() {
  return (
    <>
      <style>{globalReset}</style>
      <div className={styles.page}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link href="/" className={styles.logo}>
              <img src="/images/atg-logo.svg" alt="Ambitology" className={styles.logoIcon} />
              Ambitology
            </Link>
            <nav className={styles.breadcrumb}>
              <Link href="/" className={styles.breadcrumbLink}>Home</Link>
              <span className={styles.breadcrumbSep}>/</span>
              <Link href="/learn/career-insights" className={styles.breadcrumbCurrent}>Career Insights</Link>
            </nav>
          </div>
        </header>

        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <span className={styles.heroEyebrow}>Career Insights</span>
            <h1 className={styles.heroTitle}>Navigate Career with Success</h1>
            <p className={styles.heroDesc}>
              Expert perspectives on the skills, mindsets, and strategies that matter most
              in the age of AI — from architecture to leadership to lifelong learning.
            </p>
          </div>
        </section>

        {/* Articles Grid */}
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.grid}>
              {ARTICLES.map((article) => (
                <Link
                  key={article.slug}
                  href={`/learn/career-insights/${article.slug}`}
                  className={styles.card}
                >
                  <div className={styles.cardImage}>
                    <img
                      src={article.image}
                      alt={article.title}
                      className={styles.cardImg}
                    />
                    <span className={styles.cardCategory}>{article.category}</span>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardMeta}>
                      <span>{article.date}</span>
                      <span className={styles.cardDot} />
                      <span>{article.readTime}</span>
                    </div>
                    <h2 className={styles.cardTitle}>{article.title}</h2>
                    <p className={styles.cardExcerpt}>{article.excerpt}</p>
                    <span className={styles.cardCta}>
                      Read article
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <Link href="/" className={styles.footerLogo}>
              <img src="/images/atg-logo.svg" alt="Ambitology" className={styles.logoIcon} />
              Ambitology
            </Link>
            <p className={styles.footerCopy}>© {new Date().getFullYear()} Ambitology. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
