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

const STARTING_POINTS = [
  {
    label: "Starting as a Generalist",
    title: "You know a little about a lot. Expand each area wider.",
    desc: "Your cross-domain awareness is an asset. The AI age amplifies it — use AI tools to go from 'I understand this' to 'I can build with this' in every domain you touch. Your edge is architectural judgment across the full stack.",
  },
  {
    label: "Starting as a Specialist",
    title: "You know one domain deeply. Now expand horizontally.",
    desc: "Deep domain knowledge is genuinely rare. The risk is over-indexing and becoming siloed. Use AI tooling to extend your existing depth into adjacent technologies — cloud, APIs, data, frontend — so you become a complete engineer, not just an expert in one layer.",
  },
];

const INTERVIEW_REALITY = [
  {
    num: "01",
    title: "System design over syntax",
    desc: "Interviewers ask how you'd design a URL shortener, a notification system, or a rate limiter — not whether you've memorized Redis configuration flags.",
  },
  {
    num: "02",
    title: "Reasoning over recall",
    desc: "\"Why would you choose this database?\" and \"What are the trade-offs of this approach?\" matter far more than framework internals you can look up in 10 seconds.",
  },
  {
    num: "03",
    title: "Problem-solving over perfection",
    desc: "Can you break down an unfamiliar problem, write working code, and improve it iteratively? That's what a 45-minute coding round measures — not mastery of a specific language.",
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
              <span className={styles.metaText}>March 10, 2026</span>
              <span className={styles.metaDot} />
              <span className={styles.metaText}>6 min read</span>
            </div>

            <h1 className={styles.title}>
              Should I Go a Broader Technical Stack or Go In Depth into a Technical Area?
            </h1>

            <p className={styles.lead}>
              It's one of the most debated career questions in tech. And in the AI era, the answer has
              shifted decisively — not toward one side, but toward a third path that most people
              aren't talking about: <em>expand horizontally, regardless of where you start.</em>
            </p>

            <div className={styles.heroImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&auto=format&fit=crop&q=80"
                alt="Multiple programming languages and tools on a developer's screen"
                className={styles.heroImage}
              />
              <p className={styles.imageCaption}>
                The question isn't depth or breadth — it's which foundation you're building from, and how wide you're willing to expand.
              </p>
            </div>

            <h2 className={styles.h2}>Both Paths Now Require Horizontal Expansion</h2>
            <p className={styles.p}>
              Whether you're a generalist who understands many domains at a surface level, or a specialist
              who has gone deep on one technology or business domain, the AI era adds the same requirement
              to both paths: you must expand your technical stack horizontally. Not deeply, necessarily.
              But broadly enough to build.
            </p>
            <p className={styles.p}>
              AI coding tools — Claude Code, Cursor, GitHub Copilot — have dramatically compressed the
              time required to pick up a new technology. What once took months of focused study now takes
              days of intentional building. That means the bar for "working knowledge" has dropped, and
              the scope of what's expected from a single engineer has risen proportionally.
            </p>
            <p className={styles.p}>
              Companies increasingly expect engineers who can contribute across a full system — not just
              one layer of it. A backend engineer who has never touched a deployment pipeline, a frontend
              engineer who doesn't understand API contracts, or a data engineer who ignores observability
              will find themselves increasingly limited in scope, compensation, and career trajectory.
            </p>

            <div className={styles.pathsGrid}>
              {STARTING_POINTS.map((p) => (
                <div key={p.label} className={`${styles.pathCard} ${styles.pathCardAccent}`}>
                  <span className={styles.pathLabel}>{p.label}</span>
                  <p className={styles.pathTitle}>{p.title}</p>
                  <p className={styles.pathDesc}>{p.desc}</p>
                </div>
              ))}
            </div>

            <h2 className={styles.h2}>AI Amplifies What You Know — But the Foundation Is Still Yours</h2>
            <p className={styles.p}>
              Here's the nuance that gets lost in the "AI will replace engineers" conversation: AI tools
              amplify your existing foundation. They do not replace it.
            </p>
            <p className={styles.p}>
              A developer who understands data modeling can use Claude Code to generate database schemas
              10× faster — because they know whether the generated schema is correct, normalized, and
              appropriate for the use case. A developer who doesn't understand data modeling will accept
              a generated schema that looks reasonable but will cause performance problems at scale.
              The AI produced the same output for both developers. The difference in value is entirely
              in the human judgment applied to evaluate it.
            </p>

            <blockquote className={styles.blockquote}>
              "AI tools make you faster at building. They don't make you better at deciding what to build
              or whether what you've built is right. That judgment is still yours — and it comes from
              a real foundation, not a generated one."
            </blockquote>

            <p className={styles.p}>
              This means the minimum viable foundation in any technology isn't as high as it used to be —
              but it's still required. You need enough working knowledge to direct AI effectively, evaluate
              its output critically, and catch the class of errors that AI consistently makes. Without that
              baseline, you're not using AI as a force multiplier. You're just shipping the AI's assumptions.
            </p>

            <div className={styles.inlineImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&auto=format&fit=crop&q=80"
                alt="Developer building across multiple tools and frameworks with modern tooling"
                className={styles.inlineImage}
              />
              <p className={styles.imageCaption}>
                A working foundation across multiple technologies — even a shallow one — unlocks AI as a genuine multiplier.
              </p>
            </div>

            <h2 className={styles.h2}>Going Deeper: Build and Contribute, Don't Just Study</h2>
            <p className={styles.p}>
              Pursuing genuine depth in a specific technology or domain — the kind that enables you to
              contribute to architecture discussions, spot non-obvious failure modes, or evaluate vendor
              trade-offs — historically required either academic research or years of industrial experience.
              That's still largely true.
            </p>
            <p className={styles.p}>
              But the fastest practical path to real depth isn't a course or a certification. It's building
              a real product with the technology and operating it under real-world conditions. Or contributing
              to an open source project in that domain — reading the code, fixing bugs, writing features,
              participating in design discussions. These experiences create the kind of knowledge that
              doesn't show up in tutorials.
            </p>
            <ul className={styles.ul}>
              <li><strong>Build a small business with the technology in question.</strong> Real users, real failures, and real constraints teach things no tutorial surface. Even a product with 50 users generates domain knowledge you can't manufacture otherwise.</li>
              <li><strong>Contribute to open source in your target domain.</strong> Meaningful contributions — even documentation or test improvements — put you in contact with expert code and expert thinking. They're also a visible, credible signal on your résumé and GitHub profile.</li>
              <li><strong>Chase the cutting edge via community.</strong> Follow the engineers at the frontier of your domain — their blogs, conference talks, and GitHub activity tell you where the technology is heading before any course syllabus reflects it.</li>
            </ul>

            <h2 className={styles.h2}>What Technical Interviews Actually Test</h2>
            <p className={styles.p}>
              A persistent myth leads engineers to over-invest in deep, narrow memorization: the belief
              that technical interviews probe the most obscure corners of a framework or language. In most
              cases, they don't.
            </p>

            <div className={styles.stepsContainer}>
              {INTERVIEW_REALITY.map((item) => (
                <div key={item.num} className={styles.stepCard}>
                  <div className={styles.stepNum}>{item.num}</div>
                  <div className={styles.stepContent}>
                    <p className={styles.stepTitle}>{item.title}</p>
                    <p className={styles.stepDesc}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className={styles.p}>
              The implication for your learning strategy is significant: time spent building broad
              working knowledge across multiple technologies — especially if you can demonstrate that
              knowledge through shipped projects — is more directly valuable for passing technical
              interviews than time spent memorizing one framework at an expert level.
            </p>

            <h2 className={styles.h2}>The AI-Era Resume Play: Breadth + Projects = Wider Market</h2>
            <p className={styles.p}>
              Here's where the strategy comes together. Because AI tools allow you to build real projects
              with a working-level understanding of any technology, every stack you learn at a basic level
              becomes a stack you can add to your résumé — backed by a project that demonstrates it.
            </p>
            <p className={styles.p}>
              A candidate who has built projects using React, FastAPI, PostgreSQL, Redis, AWS Lambda, and
              a Stripe integration — even if none of those go extremely deep — can apply for a much wider
              range of roles than a candidate who only knows one of them deeply. The breadth signals
              learning agility. The projects signal you can ship. Combined, they position you as someone
              who is actively growing and already capable of contributing.
            </p>
            <p className={styles.p}>
              Pick a direction. Learn the basics of three or four technologies in that space. Build something
              real with all of them — together, if possible. Document those projects clearly on your résumé.
              That portfolio maps to a broad range of job descriptions, demonstrates real capability, and
              shows interviewers exactly the kind of engineer the AI era is rewarding.
            </p>

            <div className={styles.ambitologyBox}>
              <div className={styles.ambitologyBoxHeader}>
                <img src="/images/atg-logo.svg" alt="Ambitology" className={styles.ambitologyLogo} />
                <span className={styles.ambitologyBoxLabel}>How Ambitology Can Help</span>
              </div>
              <p className={styles.ambitologyBoxText}>
                Expanding your stack horizontally is most effective when you have a clear map of what you
                already know — and a structured plan for what to learn next. Ambitology's{" "}
                <Link href="/dashboard?tab=knowledge" className={styles.ambitologyLink}>
                  Knowledge Base
                </Link>{" "}
                is exactly that map.
              </p>
              <p className={styles.ambitologyBoxText}>
                As you add technologies, complete projects, and deepen your breadth, document everything
                in your knowledge base: stacks used, architectural decisions made, problems solved, and
                outcomes achieved. The AI agent identifies patterns in your learning profile and helps you
                see which adjacent tools are worth picking up next — based on your direction and the current
                market demand.
              </p>
              <p className={styles.ambitologyBoxText}>
                When you're ready to apply, the{" "}
                <Link href="/dashboard?tab=resume" className={styles.ambitologyLink}>
                  Résumé Builder
                </Link>{" "}
                turns your documented experience into a targeted résumé that highlights exactly the
                technologies a specific role requires — pulling from your full breadth, but leading with
                the stack that matters most for each application.
              </p>
            </div>

            <div className={styles.ctaSection}>
              <h3 className={styles.ctaTitle}>Map your stack. Plan your next move.</h3>
              <p className={styles.ctaDesc}>
                Track your growing technical breadth and generate targeted résumés for every role you want.
              </p>
              <Link href="/dashboard?tab=knowledge" className={styles.ctaButton}>
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
