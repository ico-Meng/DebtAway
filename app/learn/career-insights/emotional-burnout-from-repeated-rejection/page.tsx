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

const HIRING_METHODS = [
  {
    rank: "Tier 1 — Highest Yield",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    name: "Campus Career Fair & Industry Events",
    desc: "Direct face time with recruiters who are specifically looking to fill roles — often same-day or next-week interview invites. Attendance at tech conferences, meetups, and hackathons carries the same weight.",
    tip: "Best conversion rate of all three channels — especially for new grads.",
  },
  {
    rank: "Tier 2 — High Trust",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    name: "Internal Employee Referral",
    desc: "A referral from someone inside the company instantly elevates your application above hundreds of anonymous submissions. Hiring managers trust their teams — and referred candidates get interviews at dramatically higher rates.",
    tip: "Referred candidates are 4× more likely to be hired than cold applicants.",
  },
  {
    rank: "Tier 3 — Full Control",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    name: "Online Job Applications",
    desc: "The most accessible channel and the one you fully control. Volume, precision, and a well-optimized resume are your levers. The callback rate is lower, but it's where most people spend the majority of their search time.",
    tip: "Resume quality and ATS optimization are critical at this tier.",
  },
];

const MINDSET_TIPS = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Treat It Like a Numbers Game",
    desc: "Most rejections aren't about you — they're about volume. A company receives hundreds of applications for one role. Set a daily application goal and track it without emotional attachment.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    title: "Separate Outcome from Identity",
    desc: "A rejection email is feedback about a role fit at a specific company at a specific moment — not a verdict on your potential, intelligence, or career trajectory.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: "Build While You Search",
    desc: "Active learning during the search — a new certification, a project update, a skill added — turns waiting time into compound growth. You're better every week.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Build Your Network Proactively",
    desc: "Communities — tech meetups, Discord servers, LinkedIn groups — provide leads, referrals, and emotional support. Isolation makes burnout worse. Connection accelerates everything.",
  },
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
              <span className={styles.breadcrumbCurrent}>Emotional Burnout from Rejection</span>
            </nav>
          </div>
        </header>

        {/* ── Article ── */}
        <main className={styles.main}>
          <article className={styles.article}>

            {/* Meta */}
            <div className={styles.meta}>
              <span className={styles.category}>Job Search Strategy</span>
              <span className={styles.metaDot} />
              <span className={styles.metaText}>March 16, 2026</span>
              <span className={styles.metaDot} />
              <span className={styles.metaText}>8 min read</span>
            </div>

            {/* Title */}
            <h1 className={styles.title}>
              Emotional Burnout from Repeated Rejection: How to Stay Strategic and Keep Moving
            </h1>

            {/* Lead */}
            <p className={styles.lead}>
              Hundreds of applications sent. A handful of automated "we've decided to move forward with other
              candidates" emails. Zero real feedback. If you've been there, you know the mental toll isn't just
              frustration — it's a slow erosion of confidence that can make even opening a job board feel
              overwhelming. The mental side of the job search is a real obstacle, not just a tactical one.
              Here's how to navigate it without losing yourself in the process.
            </p>

            {/* Hero Image */}
            <div className={styles.heroImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80"
                alt="Data analytics dashboard representing strategic job search metrics and insights"
                className={styles.heroImage}
              />
              <p className={styles.imageCaption}>
                Approaching your job search like a data problem — with clear metrics and a system — removes
                the emotional noise and puts you in control.
              </p>
            </div>

            {/* Section 1 */}
            <h2 className={styles.h2}>The Real Numbers Behind Job Search Rejection</h2>
            <p className={styles.p}>
              Before you internalize a rejection, understand the environment you're operating in. The numbers
              are not personal — they're structural. A single software engineering role at a mid-size tech
              company routinely receives 200 to 500 applications within the first 48 hours of posting. Large
              tech firms see that multiply by ten. Most of those applications never reach a human eye — they're
              filtered by ATS systems scanning for keyword alignment before any recruiter reviews them.
            </p>

            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>2–3%</span>
                <span className={styles.statLabel}>Average callback rate for cold online applications in tech</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>4×</span>
                <span className={styles.statLabel}>Higher interview rate for referred candidates vs. cold applicants</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>80%</span>
                <span className={styles.statLabel}>Of jobs are filled through networking and referrals, not job boards</span>
              </div>
            </div>

            <p className={styles.p}>
              These numbers aren't meant to discourage — they're meant to reframe. A 2–3% callback rate isn't
              a reflection of your quality as a candidate. It's the baseline reality of cold online applications.
              It means 97 out of 100 applications going nowhere is entirely normal, even for strong candidates.
              Once you internalize that math, rejection loses much of its emotional sting.
            </p>

            <blockquote className={styles.blockquote}>
              "A rejection from a company that received 400 applications for one role tells you almost nothing
              about your ability to do the job. It tells you the odds were 1 in 400 — and you were one of them."
            </blockquote>

            {/* Section 2 */}
            <h2 className={styles.h2}>Work the System Strategically: The Hiring Hierarchy</h2>
            <p className={styles.p}>
              Not all application methods are created equal. There is a clear, data-backed hierarchy of
              effectiveness — and most job seekers spend nearly all of their time and energy in the lowest-yield
              channel. Understanding this hierarchy changes how you allocate your effort.
            </p>

            <div className={styles.hiringGrid}>
              {HIRING_METHODS.map((method) => (
                <div key={method.name} className={styles.hiringCard}>
                  <span className={styles.hiringRank}>{method.rank}</span>
                  <div className={styles.hiringIcon}>{method.icon}</div>
                  <span className={styles.hiringName}>{method.name}</span>
                  <span className={styles.hiringDesc}>{method.desc}</span>
                  <span className={styles.hiringTip}>{method.tip}</span>
                </div>
              ))}
            </div>

            <p className={styles.p}>
              The first two tiers — career fairs and referrals — look straightforward but require resources.
              Career fairs are most accessible when you're a new grad still connected to a university network.
              Referrals require having cultivated relationships inside target companies — not always easy when
              you're just starting out. That's where building a strong, well-positioned profile becomes critical:
              the stronger your professional signal, the more likely you are to attract inbound attention or
              be worth referring.
            </p>

            <div className={styles.highlightBox}>
              <div className={styles.highlightBoxIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <p className={styles.highlightBoxText}>
                  <strong>Strategic shortcut for online applications:</strong> Build your resume to rank well
                  in talent pools and candidate networks. Ambitology's{" "}
                  <Link href="https://ambitology.com/dashboard" className={styles.ambitologyLink}>
                    Resume & Candidate Dashboard
                  </Link>{" "}
                  helps you position your profile to surface in recruiter searches and gain referral access
                  through our network — turning a low-yield channel into a high-visibility one.
                </p>
              </div>
            </div>

            <p className={styles.p}>
              For the online application tier — the one you have full control over — the approach is simple:
              do as much as you strategically can. Apply consistently, apply broadly within your target roles,
              and let volume work in your favor. The key word is <em>strategically</em>: quality over spray-and-pray,
              but never paralysis over perfection.
            </p>

            {/* Inline image */}
            <div className={styles.inlineImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&auto=format&fit=crop&q=80"
                alt="Analytics and performance data charts representing strategic career planning"
                className={styles.inlineImage}
              />
              <p className={styles.imageCaption}>
                Treat your job search like a strategic campaign — track channels, refine your approach, and
                let data guide your energy allocation.
              </p>
            </div>

            {/* Section 3 */}
            <h2 className={styles.h2}>Rejection Is Not Evidence of Inadequacy</h2>
            <p className={styles.p}>
              This is the hardest truth to hold onto after the fifteenth rejection email — but it's also the
              most important one. In the vast majority of cases, rejection is not a verdict on your
              competence, intelligence, or potential. Companies reject candidates for reasons entirely
              disconnected from candidate quality:
            </p>
            <ul className={styles.ul}>
              <li>The role was filled internally before the job posting closed</li>
              <li>Budget was cut and the position was quietly frozen mid-process</li>
              <li>A candidate with nearly identical skills was already deep in the pipeline</li>
              <li>The job description was written for a very specific internal backfill</li>
              <li>Your resume was ATS-filtered before any human considered your profile</li>
              <li>The hiring manager changed, and the new one wants a different profile entirely</li>
            </ul>
            <p className={styles.p}>
              None of these scenarios reflect anything about you. They reflect the invisible machinery
              behind every job posting — machinery that operates entirely outside your control. Your job
              is to manage what you can: the quality of your applications, the breadth of your search,
              and the continued development of your skills.
            </p>
            <p className={styles.p}>
              Stay confident. Confidence isn't arrogance — it's the rational belief that your skills are
              real, your growth is real, and the right opportunity will materialize if you keep showing up
              strategically. The candidates who get hired aren't necessarily the most talented in the
              applicant pool — they're often the ones who stayed in the game long enough to land at the
              right place at the right time.
            </p>

            {/* Section 4 */}
            <h2 className={styles.h2}>Four Mindset Shifts That Prevent Burnout</h2>
            <p className={styles.p}>
              Burnout in a job search rarely comes from the volume of applications — it comes from
              misplaced emotional investment in each individual outcome. These four reframes protect
              your energy without requiring you to care less.
            </p>

            <div className={styles.tipsGrid}>
              {MINDSET_TIPS.map((tip) => (
                <div key={tip.title} className={styles.tipCard}>
                  <div className={styles.tipIcon}>{tip.icon}</div>
                  <span className={styles.tipTitle}>{tip.title}</span>
                  <span className={styles.tipDesc}>{tip.desc}</span>
                </div>
              ))}
            </div>

            {/* Section 5 */}
            <h2 className={styles.h2}>Keep Learning, Keep Refining, Keep Digging</h2>
            <p className={styles.p}>
              The job search is a sprint for most people and a marathon for the rest. Either way, the
              candidates who emerge stronger are the ones who treated the waiting time as investment time.
              There are three things worth doing in parallel while applications are out:
            </p>
            <ul className={styles.ul}>
              <li><strong>Keep learning technical skills</strong> aligned to your target roles. Every week you add a meaningful skill, your profile gets stronger — and your interview performance improves.</li>
              <li><strong>Keep refining your resume</strong> for specific roles, not as a generic document. Precision beats volume when it comes to resume quality. Tailor your strongest signals to each role's requirements.</li>
              <li><strong>Dig for entry-level opportunities aggressively.</strong> Startups, growing companies, contract roles, project-based work — broaden your definition of "the right first job." Getting your first professional work experience is the objective, not landing a prestige role straight out of the gate.</li>
            </ul>
            <p className={styles.p}>
              That last point is worth dwelling on: the most important outcome of your first job search
              isn't the company name on your resume — it's professional experience, full stop. A modest role
              at a less-known company becomes your springboard. The second job search is always dramatically
              easier than the first, because the fundamental barrier — no professional experience — is gone.
            </p>

            {/* Section 6 */}
            <h2 className={styles.h2}>Why Professional Experience Outweighs Even Your Best Side Project</h2>
            <p className={styles.p}>
              This is one of the most consistent signals in hiring data, and it rarely gets stated plainly:
              hiring managers are significantly more interested in candidates with professional working
              experience than those without it — regardless of how impressive the side projects are.
            </p>

            <div className={styles.compareGrid}>
              <div className={`${styles.compareCard} ${styles.sideProject}`}>
                <span className={styles.compareLabel}>Side Project</span>
                <span className={styles.compareName}>Competitive Personal Project</span>
                <ul className={styles.compareItems}>
                  <li>Self-directed, no external accountability</li>
                  <li>No code review or team collaboration</li>
                  <li>Scope defined by you, not by real constraints</li>
                  <li>No stakeholder management or deadline pressure</li>
                  <li>Impressive — but recruiter-trusted only as a secondary signal</li>
                </ul>
              </div>
              <div className={`${styles.compareCard} ${styles.workExperience}`}>
                <span className={styles.compareLabel}>Work Experience</span>
                <span className={styles.compareName}>Any Professional Role</span>
                <ul className={styles.compareItems}>
                  <li>Proves you can operate in a professional environment</li>
                  <li>Demonstrates real collaboration and communication</li>
                  <li>Code reviews, production systems, real deadlines</li>
                  <li>Instant trust signal for all subsequent applications</li>
                  <li>Opens doors to referrals, mentorship, and faster growth</li>
                </ul>
              </div>
            </div>

            <p className={styles.p}>
              This doesn't mean side projects are worthless — they're genuinely valuable, especially
              for demonstrating technical initiative. But if you have to choose between spending six
              months on a perfect side project and taking a contract role, a startup position, or even
              a part-time technical gig, choose the professional experience every single time. The
              compound effect of having "worked professionally in tech" on your resume transforms
              every future application.
            </p>
            <p className={styles.p}>
              The first professional role is the hardest to land — and the most important. Lower the
              bar for what counts. Broaden your target companies. Stay consistent. That first
              professional credential resets the entire trajectory of your search.
            </p>

            {/* Section 7 — Ambitology box */}
            <div className={styles.ambitologyBox}>
              <div className={styles.ambitologyBoxHeader}>
                <img src="/images/atg-logo.svg" alt="Ambitology" className={styles.ambitologyLogo} />
                <span className={styles.ambitologyBoxLabel}>How Ambitology Can Help</span>
              </div>
              <p className={styles.ambitologyBoxText}>
                The emotional weight of job searching gets lighter when you feel like you're progressing —
                not just waiting. <strong>Ambitology</strong> is built to give you that sense of forward momentum.
              </p>
              <p className={styles.ambitologyBoxText}>
                Our{" "}
                <Link href="https://ambitology.com/dashboard" className={styles.ambitologyLink}>
                  Resume &amp; Candidate Dashboard
                </Link>{" "}
                lets you build and refine a professional profile that ranks in our candidate pool and puts you
                in front of employers and referral networks — turning passive applications into active visibility.
                A well-rated profile in Ambitology's network creates inbound interest, not just outbound rejection.
              </p>
              <p className={styles.ambitologyBoxText}>
                As you search, Ambitology's AI agent helps you continuously refine your resume for specific
                roles, map skill gaps to target job descriptions, and track your professional development
                in a structured way. Instead of the search feeling like sending messages into a void, it
                becomes a measurable system with clear inputs and compounding results.
              </p>
              <p className={styles.ambitologyBoxText}>
                You don't need to search harder — you need to search smarter. Start by positioning yourself
                where employers are actively looking, build a profile worth referring, and let the system
                work for you while you keep developing your skills.
              </p>
            </div>

            {/* CTA */}
            <div className={styles.ctaSection}>
              <h3 className={styles.ctaTitle}>Stop sending applications into the void.</h3>
              <p className={styles.ctaDesc}>
                Build a profile that gets seen, get into referral networks, and approach your search
                with a system — not just hope.
              </p>
              <Link href="https://ambitology.com/dashboard" className={styles.ctaButton}>
                Build Your Profile
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
