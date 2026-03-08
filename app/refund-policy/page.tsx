import { Orbitron } from "next/font/google";
import Link from "next/link";
import styles from "../legal/legal.module.css";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["800"], variable: "--font-orbitron" });

export const metadata = {
  title: "Refund Policy | Ambitology",
  description: "Learn about Ambitology's refund and cancellation policy for paid subscriptions.",
};

export default function RefundPolicyPage() {
  return (
    <div className={`${styles.container} ${orbitron.variable}`}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>
            <img src="/images/atg-logo.svg" alt="Ambitology logo" className={styles.logoIcon} />
            Ambitology
          </Link>
          <Link href="/" className={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Home
          </Link>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.badge}>Legal</span>
          <h1 className={styles.heroTitle}>Refund Policy</h1>
          <p className={styles.heroMeta}>
            Effective Date: <strong>January 1, 2025</strong> &nbsp;&bull;&nbsp; Last Updated: <strong>March 6, 2026</strong>
          </p>
          <p className={styles.heroIntro}>
            We want you to be completely satisfied with Ambitology. This Refund Policy explains when and how you can request a refund for paid subscriptions and what to expect from the process.
          </p>
        </div>
      </section>

      <main className={styles.content}>
        <div className={styles.contentInner}>

          <nav className={styles.toc}>
            <h2 className={styles.tocTitle}>Contents</h2>
            <ol className={styles.tocList}>
              <li><a href="#overview" className={styles.tocLink}>Overview</a></li>
              <li><a href="#eligibility" className={styles.tocLink}>Refund Eligibility</a></li>
              <li><a href="#non-refundable" className={styles.tocLink}>Non-Refundable Items</a></li>
              <li><a href="#how-to-request" className={styles.tocLink}>How to Request a Refund</a></li>
              <li><a href="#processing" className={styles.tocLink}>Processing Time</a></li>
              <li><a href="#cancellation" className={styles.tocLink}>Cancellation vs. Refund</a></li>
              <li><a href="#exceptions" className={styles.tocLink}>Exceptional Circumstances</a></li>
              <li><a href="#disputes" className={styles.tocLink}>Disputes</a></li>
              <li><a href="#contact" className={styles.tocLink}>Contact Us</a></li>
            </ol>
          </nav>

          <div className={styles.sections}>

            <section id="overview" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>1</span>
                Overview
              </h2>
              <p className={styles.text}>
                At Ambitology, we offer subscription-based access to our AI career development platform. Because our services are delivered digitally and begin immediately upon purchase, we have a structured refund policy to balance fairness to users with the nature of our service.
              </p>
              <div className={styles.callout}>
                <strong>Summary:</strong> We offer a 7-day money-back guarantee on your first subscription purchase. Subsequent renewals are generally non-refundable once the billing period has begun, with limited exceptions.
              </div>
            </section>

            <section id="eligibility" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>2</span>
                Refund Eligibility
              </h2>
              <p className={styles.text}>You may be eligible for a full or partial refund in the following cases:</p>
              <ul className={styles.list}>
                <li>
                  <strong>7-Day Money-Back Guarantee:</strong> If you are a first-time paid subscriber and are unsatisfied with the Service, you may request a full refund within 7 calendar days of your initial purchase, provided you have not made extensive use of the platform (e.g., generating more than 3 resumes or analyses).
                </li>
                <li>
                  <strong>Technical Failure:</strong> If a confirmed technical error on our side prevented you from accessing the Service for a continuous period of 72 hours or more during your paid subscription period.
                </li>
                <li>
                  <strong>Duplicate Charge:</strong> If you were charged more than once for the same subscription period due to a billing error.
                </li>
                <li>
                  <strong>Unauthorized Transaction:</strong> If you did not authorize the transaction and report it to us within 14 days of the charge appearing.
                </li>
              </ul>
            </section>

            <section id="non-refundable" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>3</span>
                Non-Refundable Items
              </h2>
              <p className={styles.text}>The following are generally not eligible for refunds:</p>
              <ul className={styles.list}>
                <li>Subscription renewals (2-week, monthly, or 3-month) after the new billing period has begun.</li>
                <li>Requests made after the 7-day window for first-time subscribers.</li>
                <li>Accounts that have made substantial use of the platform during the billing period.</li>
                <li>Accounts suspended or terminated due to violations of our Terms of Service.</li>
                <li>Fees for services consumed and delivered (e.g., completed analyses and resumes generated).</li>
                <li>Partial periods — we do not pro-rate refunds for unused days within a billing cycle.</li>
              </ul>
            </section>

            <section id="how-to-request" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>4</span>
                How to Request a Refund
              </h2>
              <p className={styles.text}>To request a refund, please contact our support team with the following information:</p>
              <ul className={styles.list}>
                <li>The email address associated with your Ambitology account.</li>
                <li>The date of the charge you are requesting a refund for.</li>
                <li>The reason for your refund request.</li>
                <li>Any relevant screenshots or documentation (especially for technical issues).</li>
              </ul>
              <p className={styles.text}>
                You can submit a refund request by emailing us at{" "}
                <a href="mailto:admin@ambittechnology.net" className={styles.link}>admin@ambittechnology.net</a>{" "}
                with the subject line: <strong>&quot;Refund Request — [Your Account Email]&quot;</strong>
              </p>
            </section>

            <section id="processing" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>5</span>
                Processing Time
              </h2>
              <p className={styles.text}>Once we receive your refund request:</p>
              <ul className={styles.list}>
                <li>We will acknowledge your request within <strong>2 business days</strong>.</li>
                <li>We will review your request and notify you of our decision within <strong>5 business days</strong>.</li>
                <li>Approved refunds are processed through Stripe and typically appear on your statement within <strong>5–10 business days</strong>, depending on your bank or card issuer.</li>
              </ul>
              <p className={styles.text}>
                Refunds are issued to the original payment method used at the time of purchase. We are unable to refund to a different card or payment method.
              </p>
            </section>

            <section id="cancellation" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>6</span>
                Cancellation vs. Refund
              </h2>
              <p className={styles.text}>
                <strong>Cancellation</strong> and <strong>refund</strong> are two separate actions:
              </p>
              <ul className={styles.list}>
                <li>
                  <strong>Cancellation:</strong> Stops future billing. You retain access to your paid features until the end of the current billing period. No refund is issued for the remaining unused time.
                </li>
                <li>
                  <strong>Refund:</strong> A return of money already paid. Refunds are subject to the eligibility criteria described above, and approval is not automatic.
                </li>
              </ul>
              <p className={styles.text}>
                You can cancel your subscription at any time through your account settings. Cancellation will not trigger an automatic refund unless it falls within an eligible refund window.
              </p>
            </section>

            <section id="exceptions" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>7</span>
                Exceptional Circumstances
              </h2>
              <p className={styles.text}>
                We understand that circumstances can be unpredictable. In cases of serious personal hardship, medical emergencies, or other exceptional situations, we may consider refund requests outside our standard policy at our sole discretion.
              </p>
              <p className={styles.text}>
                To request consideration under exceptional circumstances, please contact us with documentation or a brief explanation of your situation. We will evaluate each request on a case-by-case basis with empathy and fairness.
              </p>
            </section>

            <section id="disputes" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>8</span>
                Disputes
              </h2>
              <p className={styles.text}>
                If you believe a charge is incorrect or unauthorized, we encourage you to contact us directly before initiating a chargeback with your bank. We are committed to resolving billing issues promptly.
              </p>
              <p className={styles.text}>
                Filing a chargeback without first contacting us may result in the suspension of your account while the dispute is reviewed. We will cooperate fully with your financial institution to resolve any legitimate disputes.
              </p>
            </section>

            <section id="contact" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>9</span>
                Contact Us
              </h2>
              <p className={styles.text}>For refund requests or billing questions, please contact us:</p>
              <div className={styles.contactCard}>
                <div className={styles.contactRow}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <a href="mailto:admin@ambittechnology.net" className={styles.link}>admin@ambittechnology.net</a>
                </div>
                <div className={styles.contactRow}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <span>Ambit Technology Group, L.L.C.</span>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>&copy; {new Date().getFullYear()} Ambit Technology Group, L.L.C. All rights reserved.</span>
          <div className={styles.footerLinks}>
            <Link href="/" className={styles.footerLink}>Home</Link>
            <Link href="/privacy-policy" className={styles.footerLink}>Privacy Policy</Link>
            <Link href="/terms-of-service" className={styles.footerLink}>Terms of Service</Link>
            <Link href="/disclaimer" className={styles.footerLink}>Disclaimer</Link>
            <Link href="/refund-policy" className={styles.footerLinkActive}>Refund Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
