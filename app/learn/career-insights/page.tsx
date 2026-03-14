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
    slug: "how-to-stay-competitive-in-the-fast-moving-ai-era",
    title: "How to Stay Competitive in the Fast-Moving AI Era as Coding Becomes Automated",
    excerpt:
      "AI tools can now write code in seconds. But engineering is far more than typing syntax — and the engineers who understand that will thrive.",
    category: "Engineering & AI",
    date: "March 14, 2026",
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
            <h1 className={styles.heroTitle}>Navigate Your Tech Career with Clarity</h1>
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
