import { Orbitron } from "next/font/google";
import Link from "next/link";
import styles from "../legal/legal.module.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-orbitron",
});

export const metadata = {
  title: "Privacy Policy | Ambitology",
  description: "Learn how Ambitology collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className={`${styles.container} ${orbitron.variable}`}>
      {/* Header */}
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

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.badge}>Legal</span>
          <h1 className={styles.heroTitle}>Privacy Policy</h1>
          <p className={styles.heroMeta}>
            Effective Date: <strong>January 1, 2025</strong> &nbsp;&bull;&nbsp; Last Updated: <strong>March 6, 2026</strong>
          </p>
          <p className={styles.heroIntro}>
            At Ambitology, we respect your privacy and are committed to protecting your personal information.
            This Privacy Policy explains how Ambit Technology Group, L.L.C. (&quot;Ambitology,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
            collects, uses, shares, and safeguards your data when you use our platform and services.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className={styles.content}>
        <div className={styles.contentInner}>

          {/* TOC */}
          <nav className={styles.toc}>
            <h2 className={styles.tocTitle}>Contents</h2>
            <ol className={styles.tocList}>
              <li><a href="#information-we-collect" className={styles.tocLink}>Information We Collect</a></li>
              <li><a href="#how-we-use" className={styles.tocLink}>How We Use Your Information</a></li>
              <li><a href="#sharing" className={styles.tocLink}>Sharing Your Information</a></li>
              <li><a href="#data-retention" className={styles.tocLink}>Data Retention</a></li>
              <li><a href="#security" className={styles.tocLink}>Data Security</a></li>
              <li><a href="#your-rights" className={styles.tocLink}>Your Rights &amp; Choices</a></li>
              <li><a href="#cookies" className={styles.tocLink}>Cookies &amp; Tracking</a></li>
              <li><a href="#third-party" className={styles.tocLink}>Third-Party Services</a></li>
              <li><a href="#children" className={styles.tocLink}>Children&apos;s Privacy</a></li>
              <li><a href="#changes" className={styles.tocLink}>Changes to This Policy</a></li>
              <li><a href="#contact" className={styles.tocLink}>Contact Us</a></li>
            </ol>
          </nav>

          {/* Sections */}
          <div className={styles.sections}>

            <section id="information-we-collect" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>1</span>
                Information We Collect
              </h2>
              <p className={styles.text}>We collect information you provide directly and information generated through your use of our services.</p>

              <h3 className={styles.subTitle}>1.1 Information You Provide</h3>
              <ul className={styles.list}>
                <li><strong>Account Information:</strong> Name, email address, and password when you create an account.</li>
                <li><strong>Profile &amp; Career Data:</strong> Resume content, work experience, skills, education, and career goals you enter into our platform.</li>
                <li><strong>Knowledge Base:</strong> Projects, skills, and professional accomplishments you submit to build your knowledge base.</li>
                <li><strong>Payment Information:</strong> Billing details processed securely through Stripe. We do not store your full payment card numbers.</li>
                <li><strong>Communications:</strong> Messages or inquiries you send to our support team.</li>
              </ul>

              <h3 className={styles.subTitle}>1.2 Information Collected Automatically</h3>
              <ul className={styles.list}>
                <li><strong>Usage Data:</strong> Pages visited, features used, session duration, and interactions within the platform.</li>
                <li><strong>Device &amp; Technical Data:</strong> IP address, browser type, operating system, and device identifiers.</li>
                <li><strong>Log Data:</strong> Server logs that record requests made to our services.</li>
              </ul>

              <h3 className={styles.subTitle}>1.3 Information from Third Parties</h3>
              <ul className={styles.list}>
                <li><strong>Authentication Providers:</strong> If you sign in via AWS Cognito or linked identity providers, we receive your profile information as permitted by your settings.</li>
                <li><strong>Banking Data (Plaid):</strong> If you connect a bank account, Plaid provides us with account information as described in their privacy policy.</li>
              </ul>
            </section>

            <section id="how-we-use" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>2</span>
                How We Use Your Information
              </h2>
              <p className={styles.text}>We use the information we collect to:</p>
              <ul className={styles.list}>
                <li>Provide, operate, and improve our AI-powered career services and resume tools.</li>
                <li>Personalize your experience, including generating tailored resume content and career fit analyses.</li>
                <li>Process payments and manage your subscription plan.</li>
                <li>Send service-related communications such as account confirmations and important updates.</li>
                <li>Respond to your support requests and inquiries.</li>
                <li>Detect, prevent, and address fraud, security incidents, and technical issues.</li>
                <li>Comply with applicable legal obligations.</li>
                <li>Conduct internal analytics to understand how our platform is used and to improve it.</li>
              </ul>
              <div className={styles.callout}>
                <strong>We do not sell your personal information to third parties.</strong> We use your career data solely to deliver the services you request.
              </div>
            </section>

            <section id="sharing" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>3</span>
                Sharing Your Information
              </h2>
              <p className={styles.text}>We may share your information in the following circumstances:</p>
              <ul className={styles.list}>
                <li><strong>Service Providers:</strong> Trusted third-party vendors who help us operate our platform (e.g., AWS for cloud infrastructure, Stripe for payments, Plaid for banking). These providers are contractually obligated to protect your data.</li>
                <li><strong>AI Services:</strong> We use AI model providers (including OpenRouter and Anthropic) to power our analysis features. Career data submitted for analysis may be processed by these providers under their respective data processing agreements.</li>
                <li><strong>Legal Requirements:</strong> We may disclose your information if required by law, legal process, or to protect the rights and safety of our users or others.</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
                <li><strong>With Your Consent:</strong> We will share your data in any other circumstances with your explicit consent.</li>
              </ul>
            </section>

            <section id="data-retention" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>4</span>
                Data Retention
              </h2>
              <p className={styles.text}>
                We retain your personal information for as long as your account is active or as needed to provide you with our services.
                You may request deletion of your account and associated data at any time by contacting us at the address below.
                We may retain certain information as required by law or for legitimate business purposes such as fraud prevention.
              </p>
              <p className={styles.text}>
                Anonymized or aggregated data that cannot identify you may be retained indefinitely for analytics and platform improvement.
              </p>
            </section>

            <section id="security" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>5</span>
                Data Security
              </h2>
              <p className={styles.text}>
                We implement industry-standard security measures to protect your personal information, including:
              </p>
              <ul className={styles.list}>
                <li>Encryption of data in transit using TLS/HTTPS.</li>
                <li>Encryption of sensitive data at rest in AWS storage services.</li>
                <li>Access controls limiting data access to authorized personnel only.</li>
                <li>Regular security reviews of our infrastructure and code.</li>
              </ul>
              <p className={styles.text}>
                While we take reasonable precautions, no security system is impenetrable. We encourage you to use a strong, unique password and to notify us immediately if you suspect unauthorized access to your account.
              </p>
            </section>

            <section id="your-rights" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>6</span>
                Your Rights &amp; Choices
              </h2>
              <p className={styles.text}>Depending on your location, you may have the following rights regarding your personal data:</p>
              <ul className={styles.list}>
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you.</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data, subject to certain exceptions.</li>
                <li><strong>Portability:</strong> Request your data in a machine-readable format.</li>
                <li><strong>Opt-Out:</strong> Opt out of non-essential marketing communications at any time.</li>
                <li><strong>Restriction:</strong> Request that we restrict processing of your data in certain circumstances.</li>
              </ul>
              <p className={styles.text}>
                To exercise any of these rights, please contact us at <a href="mailto:admin@ambittechnology.net" className={styles.link}>admin@ambittechnology.net</a>.
                We will respond to your request within 30 days.
              </p>
            </section>

            <section id="cookies" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>7</span>
                Cookies &amp; Tracking
              </h2>
              <p className={styles.text}>We use cookies and similar tracking technologies to:</p>
              <ul className={styles.list}>
                <li>Maintain your authentication session so you stay logged in.</li>
                <li>Remember your preferences and settings.</li>
                <li>Analyze platform usage and performance through anonymized analytics.</li>
              </ul>
              <p className={styles.text}>
                You can configure your browser to refuse cookies, but some features of our platform may not function properly without them.
                We do not use third-party advertising cookies or sell your browsing data.
              </p>
            </section>

            <section id="third-party" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>8</span>
                Third-Party Services
              </h2>
              <p className={styles.text}>Our platform integrates with the following third-party services. Their use of your data is governed by their own privacy policies:</p>
              <div className={styles.thirdPartyGrid}>
                <div className={styles.thirdPartyCard}>
                  <strong>AWS Cognito</strong>
                  <span>Authentication &amp; identity management</span>
                </div>
                <div className={styles.thirdPartyCard}>
                  <strong>Stripe</strong>
                  <span>Secure payment processing</span>
                </div>
                <div className={styles.thirdPartyCard}>
                  <strong>Plaid</strong>
                  <span>Bank account connection</span>
                </div>
                <div className={styles.thirdPartyCard}>
                  <strong>OpenRouter / Anthropic</strong>
                  <span>AI-powered career analysis</span>
                </div>
              </div>
            </section>

            <section id="children" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>9</span>
                Children&apos;s Privacy
              </h2>
              <p className={styles.text}>
                Our services are not directed to individuals under the age of 16. We do not knowingly collect personal information from children.
                If you believe we have inadvertently collected data from a child, please contact us and we will delete it promptly.
              </p>
            </section>

            <section id="changes" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>10</span>
                Changes to This Policy
              </h2>
              <p className={styles.text}>
                We may update this Privacy Policy from time to time. When we do, we will revise the &quot;Last Updated&quot; date at the top of this page.
                For material changes, we will notify you via email or a prominent notice on our platform.
                Your continued use of our services after any changes constitutes your acceptance of the updated policy.
              </p>
            </section>

            <section id="contact" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>11</span>
                Contact Us
              </h2>
              <p className={styles.text}>If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:</p>
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

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>&copy; {new Date().getFullYear()} Ambit Technology Group, L.L.C. All rights reserved.</span>
          <div className={styles.footerLinks}>
            <Link href="/" className={styles.footerLink}>Home</Link>
            <Link href="/privacy-policy" className={styles.footerLinkActive}>Privacy Policy</Link>
            <Link href="/terms-of-service" className={styles.footerLink}>Terms of Service</Link>
            <Link href="/disclaimer" className={styles.footerLink}>Disclaimer</Link>
            <Link href="/refund-policy" className={styles.footerLink}>Refund Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
