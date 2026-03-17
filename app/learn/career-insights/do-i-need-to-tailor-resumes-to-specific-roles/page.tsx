"use client";

import Link from "next/link";
import styles from "../shared-article.module.css";

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
              <span className={styles.breadcrumbCurrent}>Resume Tailoring Strategy</span>
            </nav>
          </div>
        </header>

        {/* ── Article ── */}
        <main className={styles.main}>
          <article className={styles.article}>

            {/* Meta */}
            <div className={styles.meta}>
              <span className={styles.category}>Resume &amp; Career</span>
              <span className={styles.metaDot} />
              <span className={styles.metaText}>March 14, 2026</span>
              <span className={styles.metaDot} />
              <span className={styles.metaText}>7 min read</span>
            </div>

            {/* Title */}
            <h1 className={styles.title}>
              Do I Need to Tailor Resumes to Specific Roles? Here&apos;s an Easy Way!
            </h1>

            {/* Lead */}
            <p className={styles.lead}>
              Every career coach says the same thing: tailor your resume for every role. And every
              job seeker knows the painful truth — doing that manually is exhausting, inconsistent,
              and unsustainable. But here&apos;s what nobody tells you: in the AI era, precision-targeted
              resumes aren&apos;t just helpful — they&apos;re the <em>minimum</em> viable strategy.
              The good news? There&apos;s a fundamentally smarter way to do it.
            </p>

            {/* Hero Image */}
            <div className={styles.heroImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&auto=format&fit=crop&q=80"
                alt="Professional carefully tailoring a resume for a specific job role"
                className={styles.heroImage}
              />
              <p className={styles.imageCaption}>
                Tailoring a resume isn&apos;t busywork — it&apos;s a precision targeting exercise. The question
                is how to do it without burning hours on every application.
              </p>
            </div>

            {/* ── Section 1: The Tailoring Dilemma ── */}
            <h2 className={styles.h2}>The Uncomfortable Truth About Resume Tailoring</h2>
            <p className={styles.p}>
              Yes — you absolutely need to tailor your resume for every role you apply to. That&apos;s
              not debatable. But the way most people think about tailoring is the problem. The conventional
              advice is to rewrite your experience bullets, swap out keywords, and reorder your skills
              section for each application. Done correctly, that takes 30–60 minutes per job. Applied
              across dozens of applications, it becomes a second job in itself — with no guaranteed return.
            </p>
            <p className={styles.p}>
              The result? Most people either don&apos;t tailor at all and send one generic resume everywhere
              (and wonder why they hear nothing back), or they tailor inconsistently — touching some things,
              forgetting others, and producing a document that&apos;s neither fully generic nor genuinely targeted.
              Both approaches leave serious opportunity on the table.
            </p>

            <div className={styles.highlightBox}>
              <div className={styles.highlightBoxIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className={styles.highlightBoxText}>
                <strong>The real problem isn&apos;t effort — it&apos;s architecture.</strong> Most people
                tailor from a fixed, static resume and work backwards. The smarter approach starts with
                a complete map of your technical identity and works forward — selecting the most relevant
                subset for each role. That&apos;s the shift that makes tailoring fast, precise, and scalable.
              </p>
            </div>

            {/* Stats */}
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <span className={styles.statNum}>6s</span>
                <span className={styles.statLabel}>Average initial scan time before a recruiter decides to read further or move on</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNum}>3×</span>
                <span className={styles.statLabel}>Higher callback rate for resumes tailored to job description keywords vs. generic versions</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNum}>75%</span>
                <span className={styles.statLabel}>Of applications filtered by ATS before any human review — keyword match is the deciding factor</span>
              </div>
            </div>

            {/* ── Section 2: AI Changes Everything ── */}
            <h2 className={styles.h2}>In the AI Era, Your Skills Grow Faster Than Any Resume Can Capture</h2>
            <p className={styles.p}>
              Here&apos;s the shift that&apos;s fundamentally changing how resume tailoring works — and why
              it matters more than ever. In the AI era, the pace at which skilled individuals build new
              technical capabilities has accelerated dramatically. With tools like ChatGPT for learning,
              Claude Code and Cursor for building, and Figma AI for design — a focused developer can
              genuinely acquire and apply new technical skills in days that would have taken months before.
            </p>
            <p className={styles.p}>
              What this means in practice: your actual technical knowledge base is almost certainly <em>broader
              and more capable</em> than the requirements of any single job posting you&apos;re applying to.
              The job description asks for React, Node.js, and AWS. You know those — but you also know
              TypeScript, GraphQL, Docker, PostgreSQL, CI/CD pipelines, and you&apos;ve been building with
              LLM APIs for six months. All of that is real. But your one-size-fits-all resume might only
              surface four of those things because that&apos;s what fit on the page.
            </p>

            <blockquote className={styles.blockquote}>
              &ldquo;In the AI era, candidates are not limited by what they can learn — they&apos;re limited
              by what their resume surface area can represent. Tailoring isn&apos;t about faking fit.
              It&apos;s about accurately presenting the most relevant slice of a skill set that now runs
              far deeper than any job description requires.&rdquo;
            </blockquote>

            <p className={styles.p}>
              This is exactly why tailoring has become more important, not less. The goal isn&apos;t to
              pretend you have skills you don&apos;t — it&apos;s to surface the most precise, most relevant
              subset of your genuine technical knowledge for each target role. A backend-heavy role gets
              your backend depth front and center. A full-stack product role gets your breadth across layers.
              A DevOps-adjacent role surfaces your infrastructure and pipeline work. Same person. Same real
              skills. Different, precise framing for each context.
            </p>

            <div className={styles.compareGrid}>
              <div className={`${styles.compareCard} ${styles.compareCardBefore}`}>
                <span className={`${styles.compareLabel} ${styles.compareLabelBefore}`}>❌ Generic resume approach</span>
                <p className={styles.compareBullet}>
                  One static document. Same skills section, same project order, same bullets for every application.
                  Technically accurate — but optimized for no role in particular.
                </p>
                <p className={styles.compareNote}>
                  Result: passes ATS sometimes, rarely feels like a precise fit to the hiring team. Blends into
                  the stack of hundreds of other generic submissions.
                </p>
              </div>
              <div className={`${styles.compareCard} ${styles.compareCardAfter}`}>
                <span className={`${styles.compareLabel} ${styles.compareLabelAfter}`}>✓ Precision-tailored approach</span>
                <p className={styles.compareBullet}>
                  A complete technical knowledge base as the source. For each role, select the most relevant
                  skill subset, surface matching projects first, mirror JD keywords explicitly.
                </p>
                <p className={styles.compareNote}>
                  Result: passes ATS reliably, signals genuine domain fit to engineers and managers, and feels
                  like it was written specifically for that team — because it was.
                </p>
              </div>
            </div>

            {/* ── Section 3: One Page Can't Hold Your Story ── */}
            <h2 className={styles.h2}>An A4 Page Cannot Represent Who You Are as an Engineer</h2>
            <p className={styles.p}>
              Let&apos;s be direct: the one-page resume is an industrial-age artifact. It was designed
              for a world where hiring was local, roles were narrow, and candidates had linear career
              paths. None of those things describe the modern technical job market — especially in
              the AI era, where a motivated engineer&apos;s genuine project portfolio can span ten
              domains and twenty technologies before they&apos;ve even landed their first full-time role.
            </p>
            <p className={styles.p}>
              A typical resume has room for roughly four to six projects and a skills section that most
              candidates keep to fifteen or twenty bullet points. That&apos;s a thumbnail — not a portrait.
              Every project you didn&apos;t list, every technology you learned but didn&apos;t have space to
              mention, every architectural pattern you understand but couldn&apos;t fit — all of it is invisible
              to the recruiter. It doesn&apos;t matter how capable you are if the document doesn&apos;t show it.
            </p>

            <div className={styles.inlineImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=900&auto=format&fit=crop&q=80"
                alt="Engineer with multiple projects and skills that exceed what fits on a traditional resume"
                className={styles.inlineImage}
              />
              <p className={styles.imageCaption}>
                Your real technical depth runs far beyond what a single A4 page can represent. Tailoring
                means choosing the right slice — but you need the full picture first.
              </p>
            </div>

            <p className={styles.p}>
              This constraint makes the tailoring strategy clear: you need a <strong>complete technical
              knowledge inventory</strong> that exists outside the resume itself — a living record of every
              project you&apos;ve built, every skill you&apos;ve mastered, every technology you understand
              deeply enough to discuss in an interview. From that inventory, you select the most relevant
              subset for each application. The resume becomes a targeted extract, not the source of truth.
            </p>

            <div className={styles.stepsContainer}>
              <div className={styles.stepCard}>
                <div className={styles.stepNum}>1</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>Build your complete technical inventory first</h3>
                  <p className={styles.stepDesc}>
                    Document every project, every technology, every skill — regardless of whether it fits
                    on a resume. This is your source of truth. Include side projects, self-study, open-source
                    contributions, anything you&apos;ve genuinely built or learned. More is better here.
                  </p>
                </div>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepNum}>2</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>Read the job description like a requirements document</h3>
                  <p className={styles.stepDesc}>
                    Extract every required and preferred technical keyword. Note the domain (fintech, DevOps,
                    consumer product, ML infrastructure, etc.). Identify what the team actually does —
                    not just what they say they want. This is your targeting filter.
                  </p>
                </div>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepNum}>3</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>Select the most precise matching subset from your inventory</h3>
                  <p className={styles.stepDesc}>
                    Cross-reference your full knowledge base against the JD requirements. Surface the
                    projects most relevant to the team&apos;s domain. Bring forward the skills that
                    match exactly — not synonyms, not approximations. Exact keyword matches win ATS filters.
                  </p>
                </div>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepNum}>4</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>Reorder for relevance, not chronology</h3>
                  <p className={styles.stepDesc}>
                    Put domain-matching projects first — even if they&apos;re not your most recent. Hiring
                    managers scan for relevance in the first thirty seconds. Make it immediately obvious
                    that you understand their world. Chronology is for the recruiter screen; relevance
                    is for the hiring decision.
                  </p>
                </div>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepNum}>5</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>Mirror the JD language precisely</h3>
                  <p className={styles.stepDesc}>
                    If the JD says &ldquo;Kubernetes&rdquo; — write Kubernetes, not &ldquo;container
                    orchestration.&rdquo; If it says &ldquo;TypeScript&rdquo; — write TypeScript, not
                    &ldquo;typed JavaScript.&rdquo; ATS systems match strings, not intent. Human
                    reviewers also unconsciously respond to language that echoes the role they wrote.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Section 4: Beyond the Resume ── */}
            <h2 className={styles.h2}>Applying via Resume Alone Is Already Outdated — Here&apos;s What&apos;s Next</h2>
            <p className={styles.p}>
              Forward-thinking companies already know that a one-page resume is a poor signal of a
              candidate&apos;s real potential. The smartest hiring teams are actively looking for richer
              data — GitHub profiles, portfolio projects, technical blogs, open-source contributions,
              and verifiable demonstrations of skill beyond self-reported bullet points. The resume gets
              you through the door; your full technical footprint determines how seriously you&apos;re taken.
            </p>
            <p className={styles.p}>
              This shift is accelerating. As AI tools make it trivial for candidates to generate polished
              resume language, recruiters are increasingly skeptical of resume content alone. The question
              they&apos;re asking — consciously or not — is: <em>can I verify this?</em> Your job as a
              candidate is to make that verification easy, and to ensure that what they find when they
              look deeper is richer, not emptier, than what the resume claimed.
            </p>

            <div className={styles.pillarsGrid}>
              <div className={styles.pillar}>
                <div className={styles.pillarIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                </div>
                <h3 className={styles.pillarTitle}>Full Project Portfolio</h3>
                <p className={styles.pillarDesc}>
                  Beyond the six projects that fit on a resume, great candidates have a portfolio that
                  showcases ten, twenty, or more genuine builds — each demonstrating technical range,
                  depth, and creative problem-solving that no bullet point can convey.
                </p>
              </div>
              <div className={styles.pillar}>
                <div className={styles.pillarIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <h3 className={styles.pillarTitle}>Verifiable Growth Trajectory</h3>
                <p className={styles.pillarDesc}>
                  Recruiters want to see not just where you are, but where you&apos;re heading. Candidates
                  who can demonstrate a clear, intentional learning trajectory — skills currently in progress,
                  projects in flight, technologies being mastered — signal exactly the kind of driven
                  self-development that top teams compete to hire.
                </p>
              </div>
              <div className={styles.pillar}>
                <div className={styles.pillarIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <h3 className={styles.pillarTitle}>Searchable Technical Identity</h3>
                <p className={styles.pillarDesc}>
                  The best hiring outcomes happen when recruiters can find you — not just evaluate you after
                  you apply. A searchable technical identity means your skills, projects, and expertise
                  are discoverable by the right teams before you even submit an application.
                </p>
              </div>
            </div>

            {/* ── Ambitology Box ── */}
            <div className={styles.ambitologyBox}>
              <div className={styles.ambitologyBoxHeader}>
                <img src="/images/atg-logo.svg" alt="Ambitology" className={styles.ambitologyLogo} />
                <span className={styles.ambitologyBoxLabel}>How Ambitology Solves This</span>
              </div>
              <p className={styles.ambitologyBoxText}>
                Ambitology was built precisely for this problem. The conventional resume workflow — starting
                from a static document, manually tweaking it for each role — is fundamentally backwards.
                Ambitology flips the model.
              </p>
              <p className={styles.ambitologyBoxText}>
                At the core of Ambitology is your{" "}
                <Link href="https://ambitology.com/dashboard?tab=knowledge" className={styles.ambitologyLink}>
                  Knowledge Base
                </Link>
                {" "}— a complete, living record of your technical identity. Every project you&apos;ve built,
                every skill you&apos;ve mastered, every technology you understand. Not limited by page count.
                Not constrained by what happened to fit in a six-bullet experience block. Your full technical
                story, organized and searchable.
              </p>
              <p className={styles.ambitologyBoxText}>
                Ambitology&apos;s AI system analyzes your Knowledge Base and draws a{" "}
                <strong>technical sketch</strong> — a structured profile of your real capabilities that
                recruiters can directly search and evaluate. Instead of reading between the lines of a
                one-page document, hiring teams get a clear, multidimensional picture of who you are as
                an engineer. And unlike a traditional resume, the platform can surface the six, ten, or
                twenty most relevant projects for any given role — not just the six that happened to make
                the last cut.
              </p>
              <p className={styles.ambitologyBoxText}>
                What sets Ambitology apart is the{" "}
                <Link href="https://ambitology.com/dashboard?tab=knowledge" className={styles.ambitologyLink}>
                  Planned Expanding Knowledge Base
                </Link>
                {" "}— where candidates can document their active learning: the skills currently in progress,
                the projects in flight, the technologies being added to their stack right now. Recruiters
                can see not just where you are today, but your verified growth trajectory. That&apos;s a
                signal no resume can convey — and it&apos;s increasingly the signal that separates offers
                from rejections.
              </p>
              <p className={styles.ambitologyBoxText}>
                There&apos;s one more problem Ambitology addresses that nobody talks about: the <strong>application-to-interview gap</strong>.
                In competitive markets, the time between submitting an application and landing an interview
                can stretch to weeks or months. By that point, you&apos;ve learned new technologies, shipped
                new projects, and deepened your understanding of entire domains. But your resume — the one
                that got you the interview — reflects who you were three months ago. Ambitology&apos;s dynamic
                profile means your Knowledge Base is always current, and you can generate a fresh, precisely
                tailored resume any time — including the morning of an interview — that reflects exactly
                who you are right now.
              </p>
            </div>

            {/* ── Section 5: The Easy Way ── */}
            <h2 className={styles.h2}>The Easy Way: From Knowledge Base to Tailored Resume in Minutes</h2>
            <p className={styles.p}>
              Here&apos;s what the optimized workflow looks like when you stop managing static resume
              files and start working from a comprehensive technical knowledge inventory:
            </p>

            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipNum}>Step 01</span>
                <h3 className={styles.tipTitle}>Build your full inventory once</h3>
                <p className={styles.tipDesc}>
                  Document every project, every skill, every technology in your Ambitology Knowledge Base.
                  This is the upfront investment — but it&apos;s done once, not rebuilt for every application.
                  From here, everything is selection, not creation.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipNum}>Step 02</span>
                <h3 className={styles.tipTitle}>Target a role, extract the signal</h3>
                <p className={styles.tipDesc}>
                  Read the job description. Pull the required keywords, note the domain, identify the
                  team&apos;s core problems. This takes five minutes — not fifty. The JD tells you exactly
                  which slice of your knowledge base to surface.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipNum}>Step 03</span>
                <h3 className={styles.tipTitle}>Generate a precision-targeted resume</h3>
                <p className={styles.tipDesc}>
                  Ambitology&apos;s AI selects the most relevant projects, surfaces the matching skills,
                  mirrors the JD language, and generates a tailored resume in minutes — not hours. Every
                  application is a fresh, targeted document without starting from scratch.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipNum}>Step 04</span>
                <h3 className={styles.tipTitle}>Keep your profile current — automatically</h3>
                <p className={styles.tipDesc}>
                  Add new projects and skills to your Knowledge Base as you learn and build. Your profile
                  stays current. Your next application draws from a richer inventory than the last one.
                  Tailoring gets faster and more powerful the more you build.
                </p>
              </div>
            </div>

            {/* ── Formula ── */}
            <div className={styles.formulaBox}>
              <p className={styles.formulaBoxTitle}>The Precision Tailoring Formula</p>
              <p className={styles.formulaText}>
                <strong>Complete Knowledge Base</strong> → Everything you&apos;ve built, learned, and mastered.
                No page limit. The source of truth for your technical identity.
              </p>
              <p className={styles.formulaText}>
                <strong>Role Analysis</strong> → Required keywords, team domain, technical stack, business
                context. What this specific team actually needs from their next hire.
              </p>
              <p className={styles.formulaText}>
                <strong>Precision Extract</strong> → The most relevant projects surfaced first, exact keyword
                matches throughout, domain-relevant framing, ownership and impact language — all drawn from
                your real experience, never fabricated.
              </p>
            </div>

            <h2 className={styles.h2}>Stop Sending Generic Resumes. Start Targeting with Precision.</h2>
            <p className={styles.p}>
              The answer to &ldquo;do I need to tailor my resume?&rdquo; has always been yes. But the
              better question — the one that actually changes your outcomes — is <em>how</em>. The
              traditional approach of manually rewriting a static document for every role is unsustainable.
              The AI-era approach starts from a complete picture of who you are technically, and extracts
              the right slice for each application with precision and speed.
            </p>
            <p className={styles.p}>
              Your skills are growing faster than any single resume can represent. Your project portfolio
              is deeper than six bullets can convey. Your growth trajectory is more compelling than any
              summary statement can capture. The right infrastructure makes all of that visible — to the
              right recruiters, for the right roles, at exactly the right moment.
            </p>

            {/* ── CTA ── */}
            <div className={styles.ctaSection}>
              <h3 className={styles.ctaTitle}>Build your complete technical profile — and tailor every application in minutes</h3>
              <p className={styles.ctaDesc}>
                Start with Ambitology&apos;s Knowledge Base. Document your full technical story once.
                Generate precision-tailored resumes for any role — and let recruiters discover your real potential.
              </p>
              <Link href="https://ambitology.com/dashboard?tab=knowledge" className={styles.ctaButton}>
                Start Building for Free
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
