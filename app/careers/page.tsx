"use client";

import { useEffect } from "react";
import Link from "next/link";
import styles from "./careers.module.css";

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

const JOB_POSITIONS = [
  {
    title: "Software Engineer Internship: Full Stack",
    type: "Internship",
    level: "Entry Level",
    tags: ["React", "Python", "AWS"],
    description: "Gain hands-on experience building full-stack features across our AI-powered career coaching platform.",
  },
  {
    title: "Full Stack Software Engineer",
    type: "Full-Time",
    level: "Mid–Senior",
    tags: ["Next.js", "FastAPI", "AWS"],
    description: "Design and ship end-to-end features spanning our Next.js frontend and FastAPI/Lambda backend.",
  },
  {
    title: "Backend Software Engineer",
    type: "Full-Time",
    level: "Mid–Senior",
    tags: ["Python", "FastAPI", "DynamoDB"],
    description: "Build scalable APIs and services powering AI agents, file processing, and third-party integrations.",
  },
  {
    title: "Frontend Software Engineer",
    type: "Full-Time",
    level: "Mid–Senior",
    tags: ["React", "TypeScript", "CSS Modules"],
    description: "Craft polished, performant user experiences that make AI career coaching intuitive and delightful.",
  },
  {
    title: "Data Analyst",
    type: "Full-Time",
    level: "Mid-Level",
    tags: ["SQL", "Python", "Tableau"],
    description: "Translate product and user data into actionable insights that guide our roadmap and growth strategy.",
  },
  {
    title: "Data Scientist",
    type: "Full-Time",
    level: "Mid–Senior",
    tags: ["ML", "Python", "LLMs"],
    description: "Research and build machine-learning models that enhance resume scoring, career fit analysis, and AI coaching.",
  },
];

const typeColor: Record<string, string> = {
  Internship: styles.badgeInternship,
  "Full-Time": styles.badgeFullTime,
};

export default function CareersPage() {
  useEffect(() => {
    document.body.classList.add("careers-page");
    return () => document.body.classList.remove("careers-page");
  }, []);

  return (
    <div className={styles.page}>
      <style>{globalReset}</style>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>
            <img src="/images/atg-logo.svg" alt="Ambitology" className={styles.logoIcon} />
            Ambitology
          </Link>
          <Link href="/" className={styles.backLink}>
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.heroBadge}>We&apos;re Hiring</span>
          <h1 className={styles.heroHeading}>Build the Future of Career Intelligence</h1>
          <p className={styles.heroSubheading}>
            Ambit Technology Group, LLC is a technology company specializing in delivering high-end career coaching solutions powered by AI, Cloud Computing, and PaaS technology. Ambitology is our flagship product that leverages AI agents to provide end-to-end solutions for job seekers — from resume optimization and debt management to personalized career coaching. Built on AWS, Next.js, and FastAPI, Ambitology empowers users to navigate their financial and professional journeys with intelligent, data-driven guidance.
          </p>
        </div>
      </section>

      {/* Jobs Grid */}
      <section className={styles.jobsSection}>
        <div className={styles.jobsInner}>
          <h2 className={styles.sectionTitle}>Open Positions</h2>
          <p className={styles.sectionSub}>Click any role to start your application.</p>
          <div className={styles.jobsGrid}>
            {JOB_POSITIONS.map((job) => (
              <Link
                key={job.title}
                href={`/jobs?role=${encodeURIComponent(job.title)}`}
                className={styles.jobCard}
              >
                <div className={styles.jobCardTop}>
                  <div className={styles.jobBadgeRow}>
                    <span className={`${styles.badge} ${typeColor[job.type]}`}>{job.type}</span>
                    <span className={styles.badgeLevel}>{job.level}</span>
                  </div>
                  <h3 className={styles.jobTitle}>{job.title}</h3>
                  <p className={styles.jobDesc}>{job.description}</p>
                </div>
                <div className={styles.jobCardBottom}>
                  <div className={styles.tagRow}>
                    {job.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                  <span className={styles.applyLink}>
                    Apply now
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
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>&copy; {new Date().getFullYear()} Ambit Technology Group, L.L.C. All rights reserved.</span>
      </footer>
    </div>
  );
}
