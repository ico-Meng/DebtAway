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
              <span className={styles.breadcrumbCurrent}>Resume Structure & Content</span>
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
              <span className={styles.metaText}>March 12, 2026</span>
              <span className={styles.metaDot} />
              <span className={styles.metaText}>8 min read</span>
            </div>

            {/* Title */}
            <h1 className={styles.title}>
              Golden Rules for Resume Structure: The Content Mistakes That Kill Great Candidates
            </h1>

            {/* Lead */}
            <p className={styles.lead}>
              Most candidates spend hours agonizing over fonts, colors, and column layouts. Meanwhile, the real
              reason resumes fail has nothing to do with design — it&apos;s a content strategy problem. Your resume
              is read by three completely different people with three completely different agendas. Until you
              understand each one, you&apos;re writing blind.
            </p>

            {/* Hero Image */}
            <div className={styles.heroImageWrap}>
              <img
                src="/images/resume-critique.jpg"
                alt="Resume structure strategy — writing a resume that passes every filter"
                className={styles.heroImage}
              />
              <p className={styles.imageCaption}>
                A great resume isn&apos;t about design. It&apos;s about understanding who reads it — and why.
              </p>
            </div>

            {/* ── Section 1: Template Trap ── */}
            <h2 className={styles.h2}>Rule #1: The Template Is Not the Problem. Stop Obsessing Over It.</h2>
            <p className={styles.p}>
              Here&apos;s the uncomfortable truth no resume template seller wants you to hear: the template
              you choose has almost zero impact on whether you get an interview. A clean, professional, single-column
              PDF beats a beautifully designed two-column infographic resume every single time — not because it looks
              better, but because it&apos;s readable by automated systems and human reviewers alike.
            </p>
            <p className={styles.p}>
              The time most candidates spend hunting for the perfect template — browsing Canva, Reddit threads, and
              LinkedIn posts — is time stolen from the only thing that actually matters: <strong>your content</strong>.
              That&apos;s the part that determines whether you get a callback. Not your color palette.
            </p>

            <div className={styles.highlightBox}>
              <div className={styles.highlightBoxIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className={styles.highlightBoxText}>
                <strong>The golden rule on format:</strong> professional beats creative. Use a single-column layout,
                standard fonts (Inter, Calibri, Helvetica), clear section headers, and consistent spacing.
                Once that bar is met — move on. Spend the rest of your energy on what the document actually says.
              </p>
            </div>

            {/* Stats */}
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <span className={styles.statNum}>&lt; 7s</span>
                <span className={styles.statLabel}>Average time an HR reviewer spends on an initial resume scan</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNum}>75%</span>
                <span className={styles.statLabel}>Of resumes eliminated by ATS before a human ever reads them</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNum}>3×</span>
                <span className={styles.statLabel}>Distinct reviewers — HR, engineer, and manager — each with different goals</span>
              </div>
            </div>

            {/* ── Section 2: The Three Audiences ── */}
            <h2 className={styles.h2}>Rule #2: Know Your Audience — All Three of Them</h2>
            <p className={styles.p}>
              The most costly misconception in resume writing is treating it as a single document for a single
              reader. In reality, your resume moves through a chain of reviewers — and each one asks a fundamentally
              different question when they look at it.
            </p>
            <p className={styles.p}>
              Get this framework right, and resume structure becomes obvious. Get it wrong, and you can have an
              impressive background and still never hear back.
            </p>

            <div className={styles.pillarsGrid}>
              <div className={styles.pillar}>
                <div className={styles.pillarIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className={styles.pillarTitle}>HR — The Keyword Gateway</h3>
                <p className={styles.pillarDesc}>
                  Checks basic eligibility: education, years of experience, and required keyword matches.
                  May use automated scripts. Rarely reads beyond the surface.
                </p>
              </div>
              <div className={styles.pillar}>
                <div className={styles.pillarIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                  </svg>
                </div>
                <h3 className={styles.pillarTitle}>Engineering Team — The Technical Bar</h3>
                <p className={styles.pillarDesc}>
                  Reviews your projects, skills, and technical depth. Assesses both hands-on
                  coding ability and breadth of domain knowledge.
                </p>
              </div>
              <div className={styles.pillar}>
                <div className={styles.pillarIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <h3 className={styles.pillarTitle}>Engineering Manager — The Fit Lens</h3>
                <p className={styles.pillarDesc}>
                  Looks for domain relevance, leadership signals, teamwork examples, and
                  anything that aligns with their team&apos;s specific business problems.
                </p>
              </div>
            </div>

            {/* ── HR Deep Dive ── */}
            <h2 className={styles.h2}>The HR Filter: Your Resume as a Keyword Database</h2>
            <p className={styles.p}>
              HR professionals — especially at large companies — are not reading your resume for nuance. They are
              triaging. When a single job posting attracts hundreds or thousands of applications, the HR team
              (or their ATS software) is looking for one thing: does this candidate check the minimum boxes?
            </p>
            <p className={styles.p}>
              Those boxes are drawn directly from the job description. Education level. Years of experience.
              Technical keywords. Required tools and languages. If your resume doesn&apos;t surface those signals
              clearly and quickly, it doesn&apos;t matter how impressive the underlying experience is — the
              document gets filtered out before a human ever reads the detail.
            </p>

            <blockquote className={styles.blockquote}>
              &ldquo;Your resume has seconds — not minutes — to prove it belongs in the next pile. HR is not being
              cruel. They&apos;re doing math on a flood of applications. Your job is to make their answer easy.&rdquo;
            </blockquote>

            <p className={styles.p}>
              What HR checks at this stage: Does the candidate meet the minimum education requirement? Do they have
              the stated years of experience? Does the resume contain the specific technical terms listed as
              required? These are binary checks. Not &ldquo;great background&rdquo; vs &ldquo;average background&rdquo;
              — just &ldquo;in&rdquo; or &ldquo;out.&rdquo;
            </p>

            <div className={styles.compareGrid}>
              <div className={`${styles.compareCard} ${styles.compareCardBefore}`}>
                <span className={`${styles.compareLabel} ${styles.compareLabelBefore}`}>❌ What gets filtered out</span>
                <p className={styles.compareBullet}>
                  &ldquo;Worked with cloud infrastructure and built backend services using modern frameworks.&rdquo;
                </p>
                <p className={styles.compareNote}>
                  Vague language. No keywords. An ATS looking for &ldquo;AWS&rdquo;, &ldquo;Node.js&rdquo;, or
                  &ldquo;Kubernetes&rdquo; finds nothing to match.
                </p>
              </div>
              <div className={`${styles.compareCard} ${styles.compareCardAfter}`}>
                <span className={`${styles.compareLabel} ${styles.compareLabelAfter}`}>✓ What passes the filter</span>
                <p className={styles.compareBullet}>
                  &ldquo;Built microservices on AWS (Lambda, ECS, API Gateway) with Node.js; deployed via
                  Kubernetes on EKS with Terraform IaC.&rdquo;
                </p>
                <p className={styles.compareNote}>
                  Every technical keyword is spelled out explicitly. ATS and HR scanning for any of those
                  terms will find an exact match.
                </p>
              </div>
            </div>

            <p className={styles.p}>
              The action implication is direct: read every job description carefully and map its required keywords
              onto your resume explicitly. Not as synonyms. Not as implied meanings. Exactly as the job description
              spells them out.
            </p>

            {/* ── Inline Image ── */}
            <div className={styles.inlineImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=900&auto=format&fit=crop&q=80"
                alt="Technical team reviewing engineering candidate resumes"
                className={styles.inlineImage}
              />
              <p className={styles.imageCaption}>
                Engineering teams look deeper — at projects, system design thinking, and technical vocabulary.
              </p>
            </div>

            {/* ── Engineering Team Deep Dive ── */}
            <h2 className={styles.h2}>The Engineering Review: Two Completely Different Tests in One Interview</h2>
            <p className={styles.p}>
              Once your resume passes the HR filter, the engineering team picks it up — and this is where most
              candidates dramatically misunderstand what&apos;s being evaluated. The engineering review is not one
              test. It is two tests with completely different expectations, and confusing them is one of the most
              expensive mistakes a candidate can make.
            </p>

            <div className={styles.pathsGrid}>
              <div className={`${styles.pathCard} ${styles.pathCardAccent}`}>
                <span className={styles.pathLabel}>Test 1</span>
                <h3 className={styles.pathTitle}>Hard Coding Skills — The Hands-On Proof</h3>
                <p className={styles.pathDesc}>
                  Algorithm and data structure problems. Coding in real time, often in a plain editor without
                  autocomplete. These test whether you can actually <em>do</em> the job at the most fundamental
                  level. There is no shortcut: you have to have practiced solving these types of problems and must
                  be able to implement a working solution within a time constraint. Your resume signals readiness
                  here through clear project work and technical depth.
                </p>
              </div>
              <div className={styles.pathCard}>
                <span className={styles.pathLabel}>Test 2</span>
                <h3 className={styles.pathTitle}>Domain &amp; System Knowledge — The Breadth Conversation</h3>
                <p className={styles.pathDesc}>
                  System design, architecture decisions, technical trade-offs. &ldquo;How would you design a
                  payment gateway?&rdquo; or &ldquo;Walk me through how message queuing works at scale.&rdquo;
                  These test your understanding and <em>ability to reason</em> about technical systems — not
                  your ability to implement them line by line. This is a knowledge and communication test.
                  You are expected to have <em>learned</em> these concepts, not necessarily built them from scratch.
                </p>
              </div>
            </div>

            <p className={styles.p}>
              This distinction is critical — and most candidates miss it completely. The system design interview
              does not require you to have personally implemented a distributed message queue to discuss Kafka.
              You need to understand it deeply enough to reason about trade-offs, describe its role in an
              architecture, and speak to when you would or wouldn&apos;t use it. That&apos;s a learning goal,
              not a building goal.
            </p>

            <div className={styles.highlightBox}>
              <div className={styles.highlightBoxIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <p className={styles.highlightBoxText}>
                <strong>The resume implication:</strong> You can — and should — list technologies, tools, and
                platforms you genuinely understand and can discuss in depth, even if you haven&apos;t hand-coded
                their full implementation from scratch. If you understand Kafka&apos;s role in an event-driven
                architecture, can explain its trade-offs, and could reason about its use in an interview, it
                belongs on your resume. Don&apos;t self-filter prematurely. Nobody is an expert in everything.
                Your first goal is to get the interview — you prove depth once you&apos;re in the room.
              </p>
            </div>

            <p className={styles.p}>
              This mindset shift unlocks something powerful: you can confidently list a wide range of technologies
              across your resume — in project descriptions, skills sections, and technical summaries — as long as
              you&apos;ve genuinely studied them and can hold an intelligent conversation about them. That&apos;s
              the bar. Not &ldquo;have you shipped this to 10 million users&rdquo; — but &ldquo;can you speak
              to it with credibility?&rdquo;
            </p>

            {/* ── Engineering Manager Deep Dive ── */}
            <h2 className={styles.h2}>The Engineering Manager Review: Domain Fit Is the Hidden Multiplier</h2>
            <p className={styles.p}>
              Engineering managers read resumes through a completely different lens than their engineers do.
              They are not primarily looking for raw technical ability — the engineering team has already
              evaluated that. What they are looking for is <em>fit at the business layer</em>: does this person&apos;s
              background intersect with the actual problems our team is solving?
            </p>
            <p className={styles.p}>
              A backend engineer with Stripe integration experience applying for a fintech payments team is a
              dramatically stronger candidate than an equally skilled engineer who has only built internal tools.
              Same technical level — completely different signal value to the hiring manager. The former already
              speaks the domain language. The ramp-up time is shorter. The risk is lower.
            </p>

            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipNum}>Signal 01</span>
                <h3 className={styles.tipTitle}>Domain Relevance</h3>
                <p className={styles.tipDesc}>
                  If a team works on payment systems, ML pipelines, or real-time data — and you have even a
                  side project that touches those areas — put it front and center. Managers actively scan for
                  this kind of alignment. A tangentially related project beats no project at all.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipNum}>Signal 02</span>
                <h3 className={styles.tipTitle}>Leadership &amp; Ownership Language</h3>
                <p className={styles.tipDesc}>
                  &ldquo;Led the migration of&hellip;&rdquo;, &ldquo;Owned the architecture for&hellip;&rdquo;,
                  &ldquo;Coordinated across three teams to&hellip;&rdquo; — managers notice this language
                  because it distinguishes contributors from future leads. Even small examples matter at
                  the junior level.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipNum}>Signal 03</span>
                <h3 className={styles.tipTitle}>Teamwork &amp; Impact</h3>
                <p className={styles.tipDesc}>
                  Quantified outcomes and collaboration context. Not just &ldquo;built a feature&rdquo; but
                  &ldquo;shipped a feature used by 8,000 daily active users, collaborating with product
                  and design across a two-week sprint.&rdquo; Managers read between the lines to assess
                  how you operate inside a team.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipNum}>Signal 04</span>
                <h3 className={styles.tipTitle}>Interesting Technical Bets</h3>
                <p className={styles.tipDesc}>
                  Managers are often intellectually curious. An unusual project — a compiler you built,
                  an edge inference system you deployed, a real-time auction engine — can spark the kind
                  of genuine interest that turns a routine technical interview into an engaged conversation.
                  Don&apos;t bury your most interesting work.
                </p>
              </div>
            </div>

            {/* ── Section 3: The Strategic Resume Mindset ── */}
            <h2 className={styles.h2}>Rule #3: Write for All Three Audiences Simultaneously</h2>
            <p className={styles.p}>
              Once you understand the three-layer review process, structuring your resume becomes a systems
              problem rather than a creative one. Every section of your resume is serving a different audience,
              and the goal is to satisfy all three without making the document feel cluttered or incoherent.
            </p>

            <div className={styles.stepsContainer}>
              <div className={styles.stepCard}>
                <div className={styles.stepNum}>1</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>Mirror the job description — keyword for keyword</h3>
                  <p className={styles.stepDesc}>
                    Read the requirements section of every job description carefully. List every technical keyword
                    stated as required or preferred. Make sure each one appears explicitly in your resume — in
                    your skills section, project descriptions, or experience bullets. Do not paraphrase. ATS systems
                    match literal strings.
                  </p>
                </div>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepNum}>2</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>Expand your technical skills — list everything you can discuss</h3>
                  <p className={styles.stepDesc}>
                    Don&apos;t limit your skills section to tools you&apos;ve used in production. Include every
                    technology you genuinely understand — languages, frameworks, cloud services, databases,
                    protocols — that you could speak to confidently in a 15-minute technical conversation.
                    The fear of being &ldquo;caught out&rdquo; is unfounded: interviewers probe depth,
                    they don&apos;t disqualify for breadth.
                  </p>
                </div>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepNum}>3</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>Surface domain-relevant projects prominently</h3>
                  <p className={styles.stepDesc}>
                    For every role you apply to, identify the team&apos;s core domain (payments, ML, infrastructure,
                    consumer product, etc.) and ensure any project you have in that area appears early and
                    with strong detail. Relevance is a multiplier at the manager level — maximize it.
                  </p>
                </div>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepNum}>4</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>Use the language of ownership and impact</h3>
                  <p className={styles.stepDesc}>
                    Every bullet in your experience and projects sections should contain: what you did, the
                    technical mechanism, and a quantified or qualified outcome. &ldquo;Reduced API latency
                    by 38% by migrating synchronous calls to async message queuing with RabbitMQ&rdquo; serves
                    HR (keywords), engineers (technical method), and managers (outcome, ownership) in one sentence.
                  </p>
                </div>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepNum}>5</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>Your first goal is to get the interview — not to be perfect</h3>
                  <p className={styles.stepDesc}>
                    Don&apos;t block yourself from listing C++, Rust, or Kubernetes because you aren&apos;t
                    a world expert. Nobody is a world expert at the interview stage. If you&apos;ve learned
                    it, worked through tutorials and projects, and can hold a credible conversation — it belongs
                    on your resume. The interview room is where depth is tested. The resume is how you get there.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Section 4: Don't Self-Censor ── */}
            <h2 className={styles.h2}>Rule #4: Stop Self-Censoring Your Technical Skills</h2>
            <p className={styles.p}>
              One of the most damaging habits among technically capable candidates is over-filtering their own
              skill list. The internal monologue sounds like: &ldquo;I&apos;ve used Redis but not in a
              production system, so I probably shouldn&apos;t list it.&rdquo; Or: &ldquo;I know Docker
              conceptually but I haven&apos;t deployed to a Kubernetes cluster myself, so maybe I should leave
              it out.&rdquo; This is the wrong framework entirely.
            </p>
            <p className={styles.p}>
              The question is not: &ldquo;Have I built a production-grade implementation of this technology?&rdquo;
              The question is: &ldquo;Can I have an intelligent conversation about this technology in a
              technical interview?&rdquo; If yes — it belongs on your resume. The deeper question of
              implementation depth will be explored during the interview itself. Your first goal is to get
              the interview. Don&apos;t block yourself at Step 0.
            </p>

            <blockquote className={styles.blockquote}>
              &ldquo;The engineering interview is designed to test two separate things: what you can code
              under pressure, and what you understand from studying and building. Don&apos;t confuse the
              two. Learn broadly, list what you know, and prove depth in the room.&rdquo;
            </blockquote>

            <p className={styles.p}>
              This applies especially to adjacent technologies. If you&apos;re a Python developer who has
              done Rust tutorials and understands its ownership model and performance trade-offs, list Rust.
              If you&apos;re a frontend engineer who has worked through distributed systems material, list
              the relevant tools and concepts you&apos;ve studied. Broad technical exposure is increasingly
              valued — especially as the hiring bar shifts toward engineers who can work across the stack
              and engage with AI-augmented workflows.
            </p>

            {/* ── Ambitology Box ── */}
            <div className={styles.ambitologyBox}>
              <div className={styles.ambitologyBoxHeader}>
                <img src="/images/atg-logo.svg" alt="Ambitology" className={styles.ambitologyLogo} />
                <span className={styles.ambitologyBoxLabel}>How Ambitology Can Help</span>
              </div>
              <p className={styles.ambitologyBoxText}>
                The strategy outlined in this article — listing all relevant technologies, matching job description
                keywords, highlighting domain-relevant projects, and building a resume that speaks to HR, engineers,
                and managers simultaneously — is exactly what{" "}
                <strong>Ambitology</strong> was built to make effortless.
              </p>
              <p className={styles.ambitologyBoxText}>
                Ambitology&apos;s{" "}
                <Link href="https://ambitology.com/dashboard?tab=knowledge" className={styles.ambitologyLink}>
                  Knowledge Base
                </Link>{" "}
                lets you systematically document your established expertise across projects, skills, and
                technologies — organized exactly the way an engineering resume should be structured. Rather than
                staring at a blank document trying to remember what you&apos;ve built, your Knowledge Base is a
                living record of your technical identity that feeds directly into resume generation.
              </p>
              <p className={styles.ambitologyBoxText}>
                More powerfully, Ambitology is the only AI platform designed to help you identify and add the
                <em> most strategically valuable</em> technologies for your target role — not just what you
                happen to remember using. The AI agent analyzes job descriptions and your existing profile, then
                surfaces the technical keywords and tools most likely to pass HR filters, impress engineering
                reviewers, and signal domain fit to hiring managers.
              </p>
              <p className={styles.ambitologyBoxText}>
                And for the keywords you haven&apos;t yet mastered?{" "}
                <Link href="https://ambitology.com/dashboard?tab=knowledge" className={styles.ambitologyLink}>
                  Ambitology&apos;s Expanding Knowledge Base
                </Link>{" "}
                lets you plan your next 3–6 months of learning: the technologies to study, the projects to build,
                and the skills to add — all structured so that by the time you schedule your interviews, every
                keyword on your resume is one you can discuss with genuine confidence. Stop applying and hoping.
                Start building and timing.
              </p>
            </div>

            {/* ── Section 5: The Formula ── */}
            <h2 className={styles.h2}>Putting It All Together: The Resume Content Formula</h2>
            <p className={styles.p}>
              A resume that works across all three filters is not three separate documents stitched together.
              It&apos;s one tightly structured document where every sentence is doing double or triple duty.
              Here&apos;s the formula in practice:
            </p>

            <div className={styles.formulaBox}>
              <p className={styles.formulaBoxTitle}>The Triple-Filter Resume Formula</p>
              <p className={styles.formulaText}>
                <strong>Skills Section</strong> → Dense, explicit keyword list for HR &amp; ATS. Every required
                technology from the job description. Every tool you can discuss in a technical interview.
              </p>
              <p className={styles.formulaText}>
                <strong>Projects Section</strong> → Technical depth for engineers + domain relevance for managers.
                What you built, the technical stack, the architecture decisions, the scale, the impact.
              </p>
              <p className={styles.formulaText}>
                <strong>Experience Section</strong> → Ownership language, team collaboration signals,
                quantified outcomes. Written for managers but packed with technical keywords for every other filter.
              </p>
            </div>

            <p className={styles.p}>
              Applied consistently, this approach means your resume passes keyword filters at the HR layer,
              demonstrates technical credibility to the engineering team, and signals domain fit and leadership
              potential to the hiring manager — all from the same document.
            </p>

            <h2 className={styles.h2}>The Takeaway: Less Template, More Strategy</h2>
            <p className={styles.p}>
              The candidates who succeed in competitive technical hiring processes aren&apos;t the ones
              with the best-formatted resumes. They&apos;re the ones who understand the system they&apos;re
              navigating. They know that HR is a keyword filter, that engineering interviews test both
              hands-on skill and intellectual breadth, and that managers are looking for domain alignment
              and ownership signals.
            </p>
            <p className={styles.p}>
              With that understanding, the resume writes itself: dense with the right keywords, specific
              about technical stacks, honest about breadth, and structured around outcomes and impact.
              Stop perfecting the template. Start building the content. That&apos;s where the interview
              offers come from.
            </p>

            {/* ── CTA ── */}
            <div className={styles.ctaSection}>
              <h3 className={styles.ctaTitle}>Build a resume that passes every filter</h3>
              <p className={styles.ctaDesc}>
                Use Ambitology&apos;s Knowledge Base to document your skills, map your projects to job requirements,
                and craft a resume tailored for HR, engineers, and managers — automatically.
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
