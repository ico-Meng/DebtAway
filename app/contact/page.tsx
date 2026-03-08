"use client";

import { useEffect } from "react";
import Link from "next/link";
import styles from "./contact.module.css";

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

export default function ContactPage() {
  useEffect(() => {
    document.body.classList.add("contact-page");
    return () => document.body.classList.remove("contact-page");
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

      {/* Main content */}
      <main className={styles.main}>
        <div className={styles.inner}>

          {/* Left column */}
          <div className={styles.left}>
            <span className={styles.eyebrow}>Contact Us</span>
            <h1 className={styles.heading}>
              Directly talk to our representatives and find your personalized service
            </h1>

            <div className={styles.officeBlock}>
              <p className={styles.officeCity}>New York</p>

              <div className={styles.contactRow}>
                <span className={styles.contactIcon}>
                  {/* Email icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <a href="mailto:admin@ambittechnology.net" className={styles.contactLink}>
                  admin@ambittechnology.net
                </a>
              </div>

              <div className={styles.contactRow}>
                <span className={styles.contactIcon}>
                  {/* Location pin */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <span className={styles.contactText}>430 Park Ave, New York, NY 10022</span>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className={styles.right}>
            <h2 className={styles.mapTitle}>New York Office</h2>
            <div className={styles.mapWrapper}>
              <iframe
                title="430 Park Ave, New York, NY 10022"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.215573291234!2d-73.97229692357!3d40.7594499!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c258e9c70b4d75%3A0x4478d5a06f44ee5b!2s430%20Park%20Ave%2C%20New%20York%2C%20NY%2010022!5e0!3m2!1sen!2sus!4v1709800000000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>&copy; {new Date().getFullYear()} Ambit Technology Group, L.L.C. All rights reserved.</span>
      </footer>
    </div>
  );
}
