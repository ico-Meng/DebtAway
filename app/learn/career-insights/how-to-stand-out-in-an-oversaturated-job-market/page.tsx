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

const TIPS = [
  { num: "01", title: "Create Your Own Experience", desc: "Register a legal company, build a real product, get real users. Eliminate the 'no experience' objection before an interviewer can raise it." },
  { num: "02", title: "Skip Entry Level", desc: "AI tools have compressed junior work. Apply for mid-level roles with your startup experience — the competition is 10× thinner." },
  { num: "03", title: "Target Well-Funded Startups", desc: "Series A–C companies are hiring aggressively while big tech is laying off. Faster growth, broader scope, less competition." },
  { num: "04", title: "Tailor Every Application", desc: "A precisely crafted résumé sent to 20 companies outperforms a generic one sent to 200. Getting the interview is step one." },
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
              <span className={styles.category}>Job Search Strategy</span>
              <span className={styles.metaDot} />
              <span className={styles.metaText}>March 4, 2026</span>
              <span className={styles.metaDot} />
              <span className={styles.metaText}>7 min read</span>
            </div>

            <h1 className={styles.title}>
              How to Stand Out in an Oversaturated Job Market with Massive Applicant Competition
            </h1>

            <p className={styles.lead}>
              The technical job market has never been more crowded. Fewer open roles. More qualified candidates than
              ever. But "more crowded" doesn't mean "impossible" — it means the bar for standing out has raised, and
              those who understand how to clear it will win decisively.
            </p>

            <div className={styles.heroImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&auto=format&fit=crop&q=80"
                alt="Software engineer focused on their laptop screen, strategizing their job search"
                className={styles.heroImage}
              />
              <p className={styles.imageCaption}>
                In a crowded market, strategy beats volume every time.
              </p>
            </div>

            <h2 className={styles.h2}>The Market Is Structurally Harder — Not Cyclically</h2>
            <p className={styles.p}>
              Between 2022 and 2024, the tech industry shed over 400,000 jobs in a correction following years of
              over-hiring. That talent — experienced, credentialed, battle-tested — flooded back into the applicant
              pool. Simultaneously, bootcamp enrollment hit record highs, universities graduated more CS students than
              any previous year, and global talent became more accessible through remote work.
            </p>
            <p className={styles.p}>
              The result: roles that once attracted 50 applications now routinely receive 500 to 2,000. For desirable
              positions at known companies, those numbers climb higher. The competition isn't temporary — it reflects
              a permanent shift in the supply of technical talent. The candidates who treat this as a new reality and
              adapt their strategy will outperform those waiting for the market to return to 2021.
            </p>

            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <span className={styles.statNum}>400K+</span>
                <span className={styles.statLabel}>tech layoffs 2022–2024</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNum}>10×</span>
                <span className={styles.statLabel}>more applicants per role vs. 2020</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNum}>5×</span>
                <span className={styles.statLabel}>referral interview callback rate</span>
              </div>
            </div>

            <h2 className={styles.h2}>Step One: Build Real Working Experience — Right Now</h2>
            <p className={styles.p}>
              The single most powerful differentiator in a crowded field is real, professional work experience. But
              here's what most job seekers miss: you don't need a company to give you that experience. You can
              manufacture it yourself — legally, professionally, and compellingly.
            </p>

            <div className={styles.highlightBox}>
              <div className={styles.highlightBoxIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <p className={styles.highlightBoxText}>
                <strong>The move:</strong> Register a real company with{" "}
                <strong>Stripe Atlas</strong> (~$500, Delaware C-Corp, up and running in days). Then build
                and ship a product using <strong>Claude Code</strong> or <strong>Cursor</strong>. Market it
                on Product Hunt, Twitter/X, Reddit, and LinkedIn. Get real users — even a small number.
                Your résumé line becomes <em>"Founder &amp; Software Engineer, [Company], Inc."</em> — not a hobby project.
                That is professional experience that the vast majority of applicants cannot claim.
              </p>
            </div>

            <p className={styles.p}>
              Take any personal project — a niche SaaS tool, a developer utility, a vertical API, a productivity
              app — and put it under your company's operation. The product doesn't need to be a unicorn. It needs
              to be real, publicly accessible, and operated with genuine intention. That combination, properly
              documented on a résumé, is more persuasive than a stack of tutorial projects.
            </p>

            <div className={styles.inlineImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=900&auto=format&fit=crop&q=80"
                alt="Startup founder working independently with modern tools"
                className={styles.inlineImage}
              />
              <p className={styles.imageCaption}>
                Building and operating your own product is real-world experience — full stop.
              </p>
            </div>

            <h2 className={styles.h2}>Stop Competing Where the Crowd Is Thickest</h2>
            <p className={styles.p}>
              Entry-level roles receive the most competition for the least reward, and AI tools are compressing
              this layer of the market further. Companies that once hired three juniors to execute a backlog now
              hire one mid-level engineer with AI in their toolkit. This is a structural shift, not a temporary dip.
            </p>
            <p className={styles.p}>
              If you have genuine project experience — especially if you've incorporated a company, shipped a
              product, and acquired users — you can legitimately target mid-level positions. The interview process
              will be more demanding, but the applicant pool will be dramatically smaller. You'll be competing
              with dozens of candidates instead of thousands.
            </p>

            <h2 className={styles.h2}>Target Well-Funded Startups — That's Where the Hiring Is</h2>
            <p className={styles.p}>
              FAANG and legacy big tech are not the growth engine they once were. After years of over-hiring and
              subsequent mass layoffs, these companies are in contraction mode. Applications there are both more
              competitive and less likely to result in strong career momentum.
            </p>
            <p className={styles.p}>
              The AI boom has funded hundreds of well-capitalized startups at Series A through C stages — companies
              with 20 to 500 employees, meaningful equity, faster career progression, and a genuine need for
              full-stack contributors. These companies receive dramatically fewer applications, give candidates
              broader ownership, and offer real learning curves that large corporations often cannot. AI-native
              startups, vertical SaaS companies, developer tooling, fintech, and healthtech are all hiring actively.
            </p>

            <h2 className={styles.h2}>Tailor Every Single Application — Without Exception</h2>
            <p className={styles.p}>
              In a high-volume market, generic applications are invisible. The ATS filters them. The recruiter
              skips them. The hiring manager never sees them. Tailoring is not optional — it's the price of entry.
            </p>
            <ul className={styles.ul}>
              <li>Mirror the exact technical keywords from the job description in your skills and experience sections</li>
              <li>Lead with the experience most relevant to that specific role — not a generic summary</li>
              <li>Map your impact to what the company actually cares about at their stage (startup ≠ enterprise)</li>
              <li>Keep it to one page; every word must justify its presence</li>
              <li>Quantify everything possible: users reached, latency reduced, revenue influenced</li>
            </ul>
            <p className={styles.p}>
              Remember: the first goal isn't to get an offer. It's to get an interview. A precisely tailored
              résumé sent to 20 companies will generate more interviews than a generic one sent to 200.
            </p>

            <div className={styles.tipsGrid}>
              {TIPS.map((t) => (
                <div key={t.num} className={styles.tipCard}>
                  <span className={styles.tipNum}>Step {t.num}</span>
                  <p className={styles.tipTitle}>{t.title}</p>
                  <p className={styles.tipDesc}>{t.desc}</p>
                </div>
              ))}
            </div>

            <div className={styles.ambitologyBox}>
              <div className={styles.ambitologyBoxHeader}>
                <img src="/images/atg-logo.svg" alt="Ambitology" className={styles.ambitologyLogo} />
                <span className={styles.ambitologyBoxLabel}>How Ambitology Can Help</span>
              </div>
              <p className={styles.ambitologyBoxText}>
                Standing out in a crowded market requires two things working in concert: a strong, documented
                background and a résumé that precisely reflects the role you're targeting. Ambitology is built
                for exactly this.
              </p>
              <p className={styles.ambitologyBoxText}>
                The{" "}
                <Link href="/dashboard?tab=resume" className={styles.ambitologyLink}>
                  AI-powered Résumé Builder
                </Link>{" "}
                tailors your résumé for each specific role in minutes — pulling from your knowledge base,
                matching the job description's keywords, and formatting your experience to tell the most
                compelling story for that particular position. No more sending the same document everywhere.
                Every application becomes your best application.
              </p>
              <p className={styles.ambitologyBoxText}>
                Combined with the{" "}
                <Link href="/dashboard?tab=knowledge" className={styles.ambitologyLink}>
                  Knowledge Base
                </Link>
                , Ambitology helps you systematically document your startup experience, personal projects,
                and technical skills in a structured format that translates directly into résumé content —
                and positions you clearly above candidates who can't articulate what they've built.
              </p>
            </div>

            <div className={styles.ctaSection}>
              <h3 className={styles.ctaTitle}>Build the résumé that gets you the interview.</h3>
              <p className={styles.ctaDesc}>
                Tailor your application per role in minutes — backed by your real experience.
              </p>
              <Link href="/dashboard?tab=resume" className={styles.ctaButton}>
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
