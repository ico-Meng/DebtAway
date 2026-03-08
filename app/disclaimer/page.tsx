import { Orbitron } from "next/font/google";
import Link from "next/link";
import styles from "../legal/legal.module.css";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["800"], variable: "--font-orbitron" });

export const metadata = {
  title: "Disclaimer | Ambitology",
  description: "Important disclaimers regarding the use of the Ambitology platform and AI-generated content.",
};

export default function DisclaimerPage() {
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
          <h1 className={styles.heroTitle}>Disclaimer</h1>
          <p className={styles.heroMeta}>
            Effective Date: <strong>January 1, 2025</strong> &nbsp;&bull;&nbsp; Last Updated: <strong>March 6, 2026</strong>
          </p>
          <p className={styles.heroIntro}>
            The information provided by Ambitology is for general career development purposes only.
            Please review the following important disclaimers regarding our platform and AI-generated content.
          </p>
        </div>
      </section>

      <main className={styles.content}>
        <div className={styles.contentInner}>

          <nav className={styles.toc}>
            <h2 className={styles.tocTitle}>Contents</h2>
            <ol className={styles.tocList}>
              <li><a href="#no-guarantee" className={styles.tocLink}>No Employment Guarantee</a></li>
              <li><a href="#ai-content" className={styles.tocLink}>AI-Generated Content</a></li>
              <li><a href="#professional-advice" className={styles.tocLink}>Not Professional Advice</a></li>
              <li><a href="#third-party" className={styles.tocLink}>Third-Party Links</a></li>
              <li><a href="#accuracy" className={styles.tocLink}>Accuracy of Information</a></li>
              <li><a href="#availability" className={styles.tocLink}>Service Availability</a></li>
              <li><a href="#external-services" className={styles.tocLink}>External Career Services</a></li>
              <li><a href="#liability" className={styles.tocLink}>Limitation of Liability</a></li>
              <li><a href="#contact" className={styles.tocLink}>Contact Us</a></li>
            </ol>
          </nav>

          <div className={styles.sections}>

            <section id="no-guarantee" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>1</span>
                No Employment Guarantee
              </h2>
              <p className={styles.text}>
                Ambitology is a career development tool designed to assist users in preparing materials and improving their career readiness.
                <strong> We do not guarantee, promise, or warrant any specific employment outcomes,</strong> including but not limited to:
              </p>
              <ul className={styles.list}>
                <li>Job offers, interviews, or callbacks from employers.</li>
                <li>Salary increases or career advancement.</li>
                <li>Acceptance to any specific company, role, or industry.</li>
                <li>Improvement in interview success rates.</li>
              </ul>
              <div className={styles.callout}>
                Career outcomes depend on many factors outside our control, including market conditions, employer preferences, individual qualifications, and economic circumstances. Results vary by individual.
              </div>
            </section>

            <section id="ai-content" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>2</span>
                AI-Generated Content
              </h2>
              <p className={styles.text}>
                Our platform uses artificial intelligence and large language models to generate career content, including resumes, analyses, and recommendations. Users should be aware that:
              </p>
              <ul className={styles.list}>
                <li>AI-generated content may contain errors, inaccuracies, or outdated information.</li>
                <li>Generated resumes and career analyses are starting points, not final polished documents. Review and edit all AI output before use.</li>
                <li>AI models may reflect biases present in their training data. We continuously work to improve our systems.</li>
                <li>Career scores and analyses are algorithmic estimates, not definitive evaluations of your employability.</li>
                <li>You are responsible for verifying the accuracy of all content before submitting it to employers.</li>
              </ul>
              <p className={styles.text}>
                <strong>Always review and verify AI-generated content</strong> before using it in actual job applications or professional contexts.
              </p>
            </section>

            <section id="professional-advice" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>3</span>
                Not Professional Advice
              </h2>
              <p className={styles.text}>
                The content provided by Ambitology — including career analyses, resume suggestions, skill gap assessments, and AI chat responses — is for informational and educational purposes only.
              </p>
              <p className={styles.text}>
                This content does not constitute:
              </p>
              <ul className={styles.list}>
                <li>Legal advice regarding employment law or contracts.</li>
                <li>Financial advice regarding salary negotiation or compensation.</li>
                <li>Psychological or counseling services.</li>
                <li>Official certification of skills or qualifications.</li>
              </ul>
              <p className={styles.text}>
                For legal, financial, or other professional guidance, please consult qualified professionals in those respective fields.
              </p>
            </section>

            <section id="third-party" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>4</span>
                Third-Party Links
              </h2>
              <p className={styles.text}>
                Our platform may contain links to third-party websites, job boards, or external services. These links are provided for your convenience and do not constitute an endorsement or recommendation by Ambitology.
              </p>
              <p className={styles.text}>
                We have no control over the content, privacy policies, or practices of third-party sites and assume no responsibility for them. We encourage you to review the privacy policy and terms of any third-party site you visit.
              </p>
            </section>

            <section id="accuracy" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>5</span>
                Accuracy of Information
              </h2>
              <p className={styles.text}>
                While we strive to keep the information on our platform accurate and up to date, we make no representations or warranties of any kind — express or implied — about the completeness, accuracy, reliability, or suitability of any information, analyses, or content provided.
              </p>
              <p className={styles.text}>
                Job market conditions, salary benchmarks, skill demand, and industry standards change rapidly. Information on our platform may not always reflect the most current developments in your field.
              </p>
            </section>

            <section id="availability" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>6</span>
                Service Availability
              </h2>
              <p className={styles.text}>
                We do not guarantee that our Service will be available uninterrupted, error-free, or free of viruses or other harmful components. We reserve the right to suspend, modify, or discontinue the Service at any time for maintenance, improvements, or other operational reasons.
              </p>
            </section>

            <section id="external-services" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>7</span>
                External Career Services
              </h2>
              <p className={styles.text}>
                Ambitology may reference or partner with external career coaching and resume design services. These are independent third-party services with their own terms, pricing, and quality standards.
              </p>
              <p className={styles.text}>
                Ambitology is not responsible for the quality, outcomes, or conduct of any third-party career service providers. Any engagement with external providers is at your own discretion and risk.
              </p>
            </section>

            <section id="liability" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>8</span>
                Limitation of Liability
              </h2>
              <p className={styles.text}>
                To the maximum extent permitted by applicable law, Ambit Technology Group, L.L.C., its officers, directors, employees, and agents shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from:
              </p>
              <ul className={styles.list}>
                <li>Your use of or inability to use the Service.</li>
                <li>Any errors or omissions in content generated by the platform.</li>
                <li>Reliance on any information provided by the Service.</li>
                <li>Unauthorized access to or alteration of your data.</li>
                <li>Employment decisions made by you or any employer based on our platform&apos;s output.</li>
              </ul>
            </section>

            <section id="contact" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>9</span>
                Contact Us
              </h2>
              <p className={styles.text}>If you have questions about this Disclaimer, please reach out:</p>
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
            <Link href="/disclaimer" className={styles.footerLinkActive}>Disclaimer</Link>
            <Link href="/refund-policy" className={styles.footerLink}>Refund Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
