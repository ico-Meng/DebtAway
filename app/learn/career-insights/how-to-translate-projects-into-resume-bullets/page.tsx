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

const FORMULA_STEPS = [
  {
    num: "1",
    title: "Project Overview + User / Client Benefit",
    desc: "One sentence that tells the reader what the project does and who it benefits. This establishes context before any technical detail appears. Think: \"Built a [what] for [who] to [achieve what].\" A recruiter should understand the purpose in under five seconds.",
  },
  {
    num: "2",
    title: "Technologies Used — Prioritized for the Role",
    desc: "List the key frameworks and tools. Do not list everything indiscriminately — prioritize the ones that appear in the job description. If you used 10 tools and the job lists 3, lead with those 3. The ATS is scanning for exact keywords; the hiring manager is scanning for relevance.",
  },
  {
    num: "3",
    title: "Performance or Impact Measurement",
    desc: "The number that makes the bullet credible and memorable. Latency reduced by X%, users served, revenue influenced, cost saved, onboarding time cut. If you don't have hard metrics, use honest qualitative impact: 'enabling real-time collaboration for 50+ distributed team members.' A rough estimate is always better than no estimate.",
  },
  {
    num: "4",
    title: "Leadership or Collaboration (When Applicable)",
    desc: "If you led a team of 2, collaborated with design and product, mentored a junior engineer, or owned the project end-to-end as a sole contributor — include it. This signals your level of seniority and professional context, especially valuable for demonstrating initiative and ownership.",
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
              <span className={styles.category}>Resume & Career</span>
              <span className={styles.metaDot} />
              <span className={styles.metaText}>March 7, 2026</span>
              <span className={styles.metaDot} />
              <span className={styles.metaText}>5 min read</span>
            </div>

            <h1 className={styles.title}>
              Difficulty Translating Projects into Résumé Bullets? Here's How!
            </h1>

            <p className={styles.lead}>
              Your best work shouldn't earn a blank stare from a recruiter. It should earn an interview.
              After weeks or months of building, your project deserves to be presented in a format that
              hiring managers actually understand — and there's a specific, learnable formula for doing exactly that.
            </p>

            <div className={styles.heroImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&auto=format&fit=crop&q=80"
                alt="Professional carefully crafting a resume, translating technical work into clear impact"
                className={styles.heroImage}
              />
              <p className={styles.imageCaption}>
                Engineering work is built in systems and code. Résumés are read in six seconds. The translation matters enormously.
              </p>
            </div>

            <h2 className={styles.h2}>The Translation Problem Is Costing You Interviews</h2>
            <p className={styles.p}>
              Developers think in systems, abstractions, and implementation details. Recruiters read
              résumés scanning for impact signals — who benefits, what changed, and how much. These
              two vocabularies are almost completely non-overlapping, which is why so many engineers
              with genuinely impressive project histories produce résumés that fail to communicate
              that value.
            </p>
            <p className={styles.p}>
              "Built a REST API" tells a recruiter nothing useful. It doesn't say who uses it, what
              problem it solves, what technology it runs on, how it performs, or what level of
              responsibility you carried. A recruiter scanning six seconds can't extract a hiring
              signal from that description — so they move on.
            </p>
            <p className={styles.p}>
              The frustrating part: the engineer who wrote that line often built something genuinely
              sophisticated. They just never translated it. Months of real work, invisible on paper
              because of a presentation problem that has a direct, learnable solution.
            </p>

            <blockquote className={styles.blockquote}>
              "Three months of engineering work condensed to nothing — not because the work wasn't
              impressive, but because the presentation didn't answer the question every recruiter
              is silently asking: <em>what did this person actually achieve?</em>"
            </blockquote>

            <h2 className={styles.h2}>The Four-Component Formula</h2>
            <p className={styles.p}>
              Every strong project résumé bullet follows a predictable structure. Once you know it,
              applying it is fast — and the difference in interview callback rate is immediate and measurable.
            </p>

            <div className={styles.formulaBox}>
              <span className={styles.formulaBoxTitle}>The Formula</span>
              <p className={styles.formulaText}>
                [What it does + who benefits] · [Technologies used, prioritized for the role] · [Performance or impact metric] · [Leadership or collaboration context]
              </p>
            </div>

            <div className={styles.stepsContainer}>
              {FORMULA_STEPS.map((step) => (
                <div key={step.num} className={styles.stepCard}>
                  <div className={styles.stepNum}>{step.num}</div>
                  <div className={styles.stepContent}>
                    <p className={styles.stepTitle}>{step.title}</p>
                    <p className={styles.stepDesc}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2 className={styles.h2}>Before and After — The Formula in Practice</h2>
            <p className={styles.p}>
              The difference between a weak and strong bullet isn't the quality of the underlying work.
              It's the completeness and specificity of the description. Here's the same project written
              both ways:
            </p>

            <div className={styles.compareGrid}>
              <div className={`${styles.compareCard} ${styles.compareCardBefore}`}>
                <span className={`${styles.compareLabel} ${styles.compareLabelBefore}`}>❌ Before</span>
                <p className={styles.compareBullet}>
                  "Built a project management tool for remote teams."
                </p>
                <p className={styles.compareNote}>
                  No technology, no metric, no scope, no impact. A recruiter cannot extract a hiring signal from this line.
                </p>
              </div>
              <div className={`${styles.compareCard} ${styles.compareCardAfter}`}>
                <span className={`${styles.compareLabel} ${styles.compareLabelAfter}`}>✓ After</span>
                <p className={styles.compareBullet}>
                  "Built a SaaS project management platform for distributed engineering teams using Next.js, FastAPI, and PostgreSQL — deployed on AWS, serving 150+ beta users with real-time task sync and a 40% reduction in onboarding time; sole founder and full-stack engineer."
                </p>
                <p className={styles.compareNote}>
                  Four components present: purpose + audience, technologies, metric, ownership. Concrete, credible, and memorable.
                </p>
              </div>
            </div>

            <p className={styles.p}>
              Both bullets describe the same project. The second one generates interview requests. The
              first one generates silence. The engineering work was identical — the presentation was not.
            </p>

            <div className={styles.inlineImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=900&auto=format&fit=crop&q=80"
                alt="Engineer reviewing and refining their resume for maximum impact"
                className={styles.inlineImage}
              />
              <p className={styles.imageCaption}>
                Every minute spent sharpening a résumé bullet pays dividends far beyond the time invested.
              </p>
            </div>

            <h2 className={styles.h2}>Prioritize Technologies That Match the Job Description</h2>
            <p className={styles.p}>
              One of the most common mistakes in the technologies section of a project bullet is treating
              it as an inventory list rather than a targeted signal. If you built a project using ten
              different tools and frameworks, listing all ten isn't impressive — it's noise that dilutes
              the most relevant information.
            </p>
            <p className={styles.p}>
              The rule is simple: read the job description before writing your résumé. Identify the two
              or three technologies it specifically names. If those appear in your project's stack, lead
              with them — even if they weren't the most central technologies you used. The ATS is
              scanning for exact keyword matches before a human ever sees your résumé.
            </p>

            <div className={styles.highlightBox}>
              <div className={styles.highlightBoxIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <p className={styles.highlightBoxText}>
                <strong>The keyword alignment rule:</strong> You used 10 tools; the job lists 3. Put those 3
                first in your technology list. Then append the others. You're not omitting anything — you're
                ordering for relevance. The same project résumé line can lead with different technologies
                depending on the role you're applying for. That's not dishonesty; it's good communication.
              </p>
            </div>

            <h2 className={styles.h2}>Quantify — Even When the Numbers Feel Small</h2>
            <p className={styles.p}>
              Engineers often hesitate to include metrics because they feel their numbers aren't impressive
              enough: "only 50 users," "only 20% improvement," "only a few months of operation." This
              hesitation is a mistake.
            </p>
            <p className={styles.p}>
              Any specific number is more credible and more memorable than no number. "50 active users"
              tells a recruiter that real people found enough value to return. "20% reduction in API
              latency" demonstrates measurement discipline and engineering rigor. "Launched and operated
              for 6 months" signals commitment and follow-through.
            </p>
            <ul className={styles.ul}>
              <li>If you have exact metrics, use them: users, page views, response time, uptime, revenue</li>
              <li>If you have approximate metrics, use conservative estimates: "50+ users," "reduced by ~30%"</li>
              <li>If you have no quantitative metric, write a qualitative impact: "enabling real-time collaboration for distributed teams across 3 time zones"</li>
              <li>Never leave this component blank — a bullet without an impact statement reads as a task description, not an accomplishment</li>
            </ul>

            <div className={styles.ambitologyBox}>
              <div className={styles.ambitologyBoxHeader}>
                <img src="/images/atg-logo.svg" alt="Ambitology" className={styles.ambitologyLogo} />
                <span className={styles.ambitologyBoxLabel}>How Ambitology Can Help</span>
              </div>
              <p className={styles.ambitologyBoxText}>
                The four-component formula works best when your project history is already well-documented.
                Ambitology's{" "}
                <Link href="https://ambitology.com/dashboard?tab=knowledge" className={styles.ambitologyLink}>
                  Knowledge Base
                </Link>{" "}
                is the place to record every project as you build it — the technologies used, the problems
                solved, the outcomes achieved, and the context of your role. When it's time to apply, that
                documentation becomes the raw material for your résumé bullets.
              </p>
              <p className={styles.ambitologyBoxText}>
                The{" "}
                <Link href="https://ambitology.com/dashboard?tab=resume" className={styles.ambitologyLink}>
                  AI-powered Résumé Builder
                </Link>{" "}
                takes your documented experience and generates targeted, four-component bullets for each role
                you apply to — automatically prioritizing the technologies and impact metrics most relevant to
                that specific job description. What used to take hours of rewriting takes minutes. And every
                application goes out with precisely crafted bullets that answer the recruiter's question before
                they even think to ask it.
              </p>
              <p className={styles.ambitologyBoxText}>
                Build your knowledge base as you work. Let Ambitology translate it into the résumé
                language that gets you interviews.
              </p>
            </div>

            <div className={styles.ctaSection}>
              <h3 className={styles.ctaTitle}>Turn your best work into your best résumé.</h3>
              <p className={styles.ctaDesc}>
                Document your projects, apply the formula, and generate role-specific bullets — in minutes.
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
