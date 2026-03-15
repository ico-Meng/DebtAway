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

const CHANNELS = [
  {
    num: 1,
    title: "Staff Referrals",
    desc: "A referred candidate gets 5–10× more interview callbacks than a cold application. Invest in building genuine relationships with engineers at your target companies — through LinkedIn, shared communities, open source, or events. Referrals are the single highest-ROI channel at early career.",
  },
  {
    num: 2,
    title: "Campus Recruiting",
    desc: "If you're currently enrolled, on-campus recruiting is still one of the best-designed pathways into the industry. Companies show up specifically to find candidates at your stage. Treat every career fair, info session, and campus event as a live networking opportunity, not just a resume drop.",
  },
  {
    num: 3,
    title: "Cold Outreach to Hiring Managers",
    desc: "A short, specific LinkedIn message to a relevant engineering manager — referencing something real about their team's work — can open a door that the formal application queue never would. The message must be direct, relevant, and under 100 words. Don't pitch; ask a genuine question.",
  },
  {
    num: 4,
    title: "Online Applications (Baseline, Not Edge)",
    desc: "Apply broadly, but understand that the ATS queue is your hardest channel. Volume helps, but only if combined with precise tailoring. A keyword-matched, one-page résumé specific to the role dramatically outperforms a generic document, even for cold applications.",
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
              <span className={styles.category}>Early Career</span>
              <span className={styles.metaDot} />
              <span className={styles.metaText}>February 26, 2026</span>
              <span className={styles.metaDot} />
              <span className={styles.metaText}>6 min read</span>
            </div>

            <h1 className={styles.title}>
              No Internship, So No Credible Signal. Here's the Way Out!
            </h1>

            <p className={styles.lead}>
              Recruiters use internships as a shorthand for one thing: "someone already evaluated this person
              in a professional context and found them employable." Without that signal, you carry a question
              mark. The answer isn't to apologize for the gap — it's to replace it with something equally
              credible. Or better.
            </p>

            <div className={styles.heroImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&auto=format&fit=crop&q=80"
                alt="Person focused at a desk, building their career path independently"
                className={styles.heroImage}
              />
              <p className={styles.imageCaption}>
                The absence of an internship isn't a permanent disadvantage — it's a problem with a solution.
              </p>
            </div>

            <h2 className={styles.h2}>The Signal Problem — And Why It's Solvable</h2>
            <p className={styles.p}>
              When a recruiter scans a résumé in six seconds, they're looking for pattern recognition. A
              recognizable company name in the experience section — even as an intern — triggers "this person
              cleared a bar somewhere." It shortens the evaluation required on the recruiter's end.
            </p>
            <p className={styles.p}>
              Candidates without internships don't fail because they're less capable. They fail because they
              haven't yet provided the recruiter with a fast, legible reason to trust their professional
              readiness. That's a presentation problem, not a capability problem. And presentation problems
              have direct solutions.
            </p>

            <blockquote className={styles.blockquote}>
              "Don't wait for a company to give you a signal. Build one yourself — with the same
              legal structure, professional accountability, and real deliverables that any employer would recognize."
            </blockquote>

            <h2 className={styles.h2}>Hire Yourself: Build a Real, Operating Business</h2>
            <p className={styles.p}>
              The most direct and permanent solution to the signal problem is to create professional experience
              independently — by founding and operating a real company. Not a side project. A registered legal
              entity with a product, users, and accountability.
            </p>
            <p className={styles.p}>
              <strong>Stripe Atlas</strong> makes this remarkably accessible: a Delaware C-Corp, registered
              agent, EIN, and Stripe payments account for around $500, completed in days. This gives you a
              legitimate business structure that any recruiter or hiring manager will recognize on a résumé.
            </p>
            <p className={styles.p}>
              Use AI-powered development tools — <strong>Claude Code</strong>, <strong>Cursor</strong>, or
              GitHub Copilot — to ship an actual product. Pick any real problem in a niche you understand.
              Build a minimum viable version. Deploy it publicly. Then operate it: respond to users, ship
              updates, handle bugs, iterate. Do this for three to six months.
            </p>

            <div className={styles.highlightBox}>
              <div className={styles.highlightBoxIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <p className={styles.highlightBoxText}>
                After 3–6 months, your résumé reads: <strong>"Founder &amp; Software Engineer, [Company], Inc."</strong>
                — followed by real deliverables: a shipped product, real users, real feedback incorporated, and
                technical decisions made. That's not a side project. That's professional work experience. It
                answers the signal question before the recruiter can ask it.
              </p>
            </div>

            <h2 className={styles.h2}>Tailor Every Application with Precision</h2>
            <p className={styles.p}>
              Volume alone won't carry you. Applying to 300 companies with the same document produces a
              predictable result: form rejections. The candidates who get interviews apply with purpose —
              matching their genuine background to roles where they're a credible fit.
            </p>
            <ul className={styles.ul}>
              <li><strong>Pick a direction first:</strong> backend engineering at fintech startups, frontend at consumer apps, full-stack at early-stage SaaS. Specificity improves every part of the application process.</li>
              <li><strong>Match the exact keywords:</strong> Applicant tracking systems filter before humans read. The job description contains the keywords your résumé needs to reflect your real background honestly.</li>
              <li><strong>Lead with your strongest signal:</strong> If your startup experience is your most credible credential, it leads. Every section is ordered by relevance to the specific role.</li>
              <li><strong>Quantify wherever possible:</strong> "Built a CRUD API" is weak. "Built a REST API serving 200 daily active users with 99.7% uptime" is a signal.</li>
            </ul>

            <div className={styles.inlineImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&auto=format&fit=crop&q=80"
                alt="Professional networking and relationship-building for career advancement"
                className={styles.inlineImage}
              />
              <p className={styles.imageCaption}>
                Staff referrals consistently produce the highest interview callback rates of any channel.
              </p>
            </div>

            <h2 className={styles.h2}>Apply Smart — Use Every Channel Available</h2>
            <p className={styles.p}>
              Online applications are the most common channel, but not the most effective one. To maximize
              your chances, treat your job search as a multi-channel campaign:
            </p>

            <div className={styles.stepsContainer}>
              {CHANNELS.map((c) => (
                <div key={c.num} className={styles.stepCard}>
                  <div className={styles.stepNum}>{c.num}</div>
                  <div className={styles.stepContent}>
                    <p className={styles.stepTitle}>{c.title}</p>
                    <p className={styles.stepDesc}>{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.ambitologyBox}>
              <div className={styles.ambitologyBoxHeader}>
                <img src="/images/atg-logo.svg" alt="Ambitology" className={styles.ambitologyLogo} />
                <span className={styles.ambitologyBoxLabel}>How Ambitology Can Help</span>
              </div>
              <p className={styles.ambitologyBoxText}>
                Two things can replace a missing internship signal: a precisely tailored résumé and a strong
                referral. Ambitology is built to accelerate both.
              </p>
              <p className={styles.ambitologyBoxText}>
                The{" "}
                <Link href="https://ambitology.com/dashboard?tab=resume" className={styles.ambitologyLink}>
                  AI-powered Résumé Builder
                </Link>{" "}
                tailors your résumé per specific role — pulling from your documented experience, matching
                keywords from the job description, and structuring your background to tell the strongest
                possible story for that position. What used to take hours of rewriting takes minutes. And
                every application goes out as your best application.
              </p>
              <p className={styles.ambitologyBoxText}>
                On the referral side, Ambitology uses your{" "}
                <Link href="https://ambitology.com/dashboard?tab=knowledge" className={styles.ambitologyLink}>
                  Knowledge Base
                </Link>{" "}
                — your documented skills, projects, and experience — to help identify referral opportunities
                where your background genuinely aligns. A referral is most powerful when the person referring
                you can speak specifically to your capabilities. A strong, well-documented knowledge base gives
                them exactly that context.
              </p>
            </div>

            <div className={styles.ctaSection}>
              <h3 className={styles.ctaTitle}>Create your own credible signal — starting today.</h3>
              <p className={styles.ctaDesc}>
                Build your experience, tailor your résumé per role, and put yourself in front of the right people.
              </p>
              <Link href="https://ambitology.com/dashboard?tab=resume" className={styles.ctaButton}>
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
