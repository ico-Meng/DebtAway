import { Orbitron } from "next/font/google";
import Link from "next/link";
import styles from "../legal/legal.module.css";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["800"], variable: "--font-orbitron" });

export const metadata = {
  title: "Terms of Service | Ambitology",
  description: "Read the Terms of Service governing your use of the Ambitology platform.",
};

export default function TermsOfServicePage() {
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
          <h1 className={styles.heroTitle}>Terms of Service</h1>
          <p className={styles.heroMeta}>
            Effective Date: <strong>January 1, 2025</strong> &nbsp;&bull;&nbsp; Last Updated: <strong>March 6, 2026</strong>
          </p>
          <p className={styles.heroIntro}>
            Please read these Terms of Service carefully before using the Ambitology platform. By accessing or using our services,
            you agree to be bound by these terms. If you do not agree, please do not use our platform.
          </p>
        </div>
      </section>

      <main className={styles.content}>
        <div className={styles.contentInner}>

          <nav className={styles.toc}>
            <h2 className={styles.tocTitle}>Contents</h2>
            <ol className={styles.tocList}>
              <li><a href="#acceptance" className={styles.tocLink}>Acceptance of Terms</a></li>
              <li><a href="#eligibility" className={styles.tocLink}>Eligibility</a></li>
              <li><a href="#account" className={styles.tocLink}>Account Registration</a></li>
              <li><a href="#services" className={styles.tocLink}>Description of Services</a></li>
              <li><a href="#subscription" className={styles.tocLink}>Subscriptions &amp; Payments</a></li>
              <li><a href="#acceptable-use" className={styles.tocLink}>Acceptable Use</a></li>
              <li><a href="#intellectual-property" className={styles.tocLink}>Intellectual Property</a></li>
              <li><a href="#user-content" className={styles.tocLink}>User Content</a></li>
              <li><a href="#termination" className={styles.tocLink}>Termination</a></li>
              <li><a href="#disclaimers" className={styles.tocLink}>Disclaimers</a></li>
              <li><a href="#limitation" className={styles.tocLink}>Limitation of Liability</a></li>
              <li><a href="#governing-law" className={styles.tocLink}>Governing Law</a></li>
              <li><a href="#changes" className={styles.tocLink}>Changes to Terms</a></li>
              <li><a href="#contact" className={styles.tocLink}>Contact Us</a></li>
            </ol>
          </nav>

          <div className={styles.sections}>

            <section id="acceptance" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>1</span>
                Acceptance of Terms
              </h2>
              <p className={styles.text}>
                By creating an account, accessing, or using the Ambitology platform (&quot;Service&quot;) operated by Ambit Technology Group, L.L.C. (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;),
                you acknowledge that you have read, understood, and agree to be bound by these Terms of Service (&quot;Terms&quot;) and our Privacy Policy.
              </p>
              <p className={styles.text}>
                These Terms constitute a legally binding agreement between you and Ambit Technology Group, L.L.C. If you are using our Service on behalf of an organization, you represent that you have authority to bind that organization to these Terms.
              </p>
            </section>

            <section id="eligibility" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>2</span>
                Eligibility
              </h2>
              <p className={styles.text}>To use our Service, you must:</p>
              <ul className={styles.list}>
                <li>Be at least 16 years of age.</li>
                <li>Have the legal capacity to enter into a binding agreement.</li>
                <li>Not be prohibited from using the Service under applicable laws.</li>
                <li>Provide accurate and complete information during registration.</li>
              </ul>
              <p className={styles.text}>
                We reserve the right to refuse access to the Service to any person or entity at our sole discretion.
              </p>
            </section>

            <section id="account" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>3</span>
                Account Registration
              </h2>
              <p className={styles.text}>When you register for an account, you agree to:</p>
              <ul className={styles.list}>
                <li>Provide accurate, current, and complete information.</li>
                <li>Maintain and promptly update your account information.</li>
                <li>Keep your login credentials confidential and secure.</li>
                <li>Notify us immediately of any unauthorized access to your account.</li>
                <li>Be responsible for all activities that occur under your account.</li>
              </ul>
              <p className={styles.text}>
                You may not share your account with others, create multiple accounts to circumvent restrictions, or transfer your account without our written consent.
              </p>
            </section>

            <section id="services" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>4</span>
                Description of Services
              </h2>
              <p className={styles.text}>
                Ambitology provides an AI-powered career development platform that includes the following services:
              </p>
              <ul className={styles.list}>
                <li><strong>Knowledge Base Builder:</strong> Tools to document your skills, experience, and projects.</li>
                <li><strong>Resume Craft:</strong> AI-assisted resume generation tailored to target positions.</li>
                <li><strong>Career Fit Analysis:</strong> Six-dimension matching scores comparing your profile to job requirements.</li>
                <li><strong>AI Chat Assistant:</strong> Conversational AI to assist with career questions and guidance.</li>
              </ul>
              <p className={styles.text}>
                We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time with reasonable notice where practicable.
              </p>
            </section>

            <section id="subscription" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>5</span>
                Subscriptions &amp; Payments
              </h2>
              <h3 className={styles.subTitle}>5.1 Subscription Plans</h3>
              <p className={styles.text}>
                We offer both free and paid subscription plans. Paid plans provide access to enhanced features and increased usage limits.
                By subscribing to a paid plan, you authorize us to charge your payment method on a recurring basis.
              </p>
              <h3 className={styles.subTitle}>5.2 Billing</h3>
              <ul className={styles.list}>
                <li>Subscriptions are billed in advance on the cycle you select (2-week, monthly, or 3-month).</li>
                <li>All payments are processed securely through Stripe.</li>
                <li>Prices are listed in USD and are subject to applicable taxes.</li>
                <li>We reserve the right to change pricing with 30 days&apos; advance notice.</li>
              </ul>
              <h3 className={styles.subTitle}>5.3 Cancellation</h3>
              <p className={styles.text}>
                You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of the current billing period.
                You will continue to have access to paid features until the end of the period you have paid for.
              </p>
              <div className={styles.callout}>
                For refund information, please refer to our <Link href="/refund-policy" className={styles.link}>Refund Policy</Link>.
              </div>
            </section>

            <section id="acceptable-use" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>6</span>
                Acceptable Use
              </h2>
              <p className={styles.text}>You agree not to use our Service to:</p>
              <ul className={styles.list}>
                <li>Violate any applicable laws, regulations, or third-party rights.</li>
                <li>Submit false, misleading, or fraudulent information.</li>
                <li>Attempt to gain unauthorized access to our systems or other users&apos; accounts.</li>
                <li>Scrape, crawl, or extract data from our platform through automated means without permission.</li>
                <li>Reverse-engineer, decompile, or disassemble any part of our Service.</li>
                <li>Transmit viruses, malware, or any other harmful code.</li>
                <li>Engage in any activity that disrupts or interferes with the Service.</li>
                <li>Use the Service to generate content that is fraudulent, defamatory, or deceptive to employers.</li>
              </ul>
              <p className={styles.text}>
                Violation of these terms may result in immediate account termination and, where applicable, legal action.
              </p>
            </section>

            <section id="intellectual-property" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>7</span>
                Intellectual Property
              </h2>
              <p className={styles.text}>
                All content, features, and functionality of the Ambitology platform — including but not limited to the software, algorithms, design, text, graphics, logos, and trademarks — are owned by Ambit Technology Group, L.L.C. and are protected by intellectual property laws.
              </p>
              <p className={styles.text}>
                We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your personal career development purposes. This license does not include the right to resell, sublicense, or commercially exploit any part of our Service.
              </p>
            </section>

            <section id="user-content" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>8</span>
                User Content
              </h2>
              <p className={styles.text}>
                You retain ownership of any content you submit to our platform, including resume data, career information, and knowledge base entries (&quot;User Content&quot;).
              </p>
              <p className={styles.text}>
                By submitting User Content, you grant us a limited, worldwide, royalty-free license to use, process, and store your content solely for the purpose of providing and improving our Service. We will not sell your User Content to third parties.
              </p>
              <p className={styles.text}>
                You represent and warrant that your User Content does not infringe on the rights of any third party and that you have the right to submit it.
              </p>
            </section>

            <section id="termination" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>9</span>
                Termination
              </h2>
              <p className={styles.text}>
                We reserve the right to suspend or terminate your account and access to the Service at any time, with or without notice, for conduct that we determine violates these Terms or is harmful to other users, us, or third parties.
              </p>
              <p className={styles.text}>
                You may terminate your account at any time by contacting us or using the account deletion feature in your settings. Upon termination, your right to use the Service will immediately cease.
              </p>
            </section>

            <section id="disclaimers" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>10</span>
                Disclaimers
              </h2>
              <p className={styles.text}>
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p className={styles.text}>
                We do not guarantee that our AI-generated content, including resumes and career analyses, will result in employment offers or any specific career outcomes. The Service is a tool to assist your career development, not a guarantee of results.
              </p>
            </section>

            <section id="limitation" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>11</span>
                Limitation of Liability
              </h2>
              <p className={styles.text}>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, AMBIT TECHNOLOGY GROUP, L.L.C. SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE.
              </p>
              <p className={styles.text}>
                OUR TOTAL CUMULATIVE LIABILITY TO YOU FOR ANY CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
              </p>
            </section>

            <section id="governing-law" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>12</span>
                Governing Law
              </h2>
              <p className={styles.text}>
                These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law principles. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of courts located in Delaware.
              </p>
            </section>

            <section id="changes" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>13</span>
                Changes to Terms
              </h2>
              <p className={styles.text}>
                We reserve the right to modify these Terms at any time. When we make material changes, we will notify you via email or a prominent notice on our platform and update the &quot;Last Updated&quot; date.
                Your continued use of the Service after changes become effective constitutes your acceptance of the updated Terms.
              </p>
            </section>

            <section id="contact" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>14</span>
                Contact Us
              </h2>
              <p className={styles.text}>If you have any questions about these Terms of Service, please contact us:</p>
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
            <Link href="/terms-of-service" className={styles.footerLinkActive}>Terms of Service</Link>
            <Link href="/disclaimer" className={styles.footerLink}>Disclaimer</Link>
            <Link href="/refund-policy" className={styles.footerLink}>Refund Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
