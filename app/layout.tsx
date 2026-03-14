import type { Metadata, Viewport } from "next";
import { Inter, Comfortaa, Orbitron, Lato, Nunito, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./app.css";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-comfortaa",
});
const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-orbitron",
});
const lato = Lato({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-lato",
});
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["800", "900"],
  variable: "--font-nunito",
});
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
});

const BASE_URL = "https://ambitology.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Ambitology | AI-Powered Career Platform for Tech Professionals",
    template: "%s | Ambitology",
  },
  description:
    "Ambitology is an AI-powered career platform that helps tech professionals build knowledge bases, craft AI-tailored resumes, score career fit, and ace interviews — all in one intelligent loop.",
  keywords: [
    "AI career platform",
    "AI resume builder",
    "career fit analysis",
    "job interview preparation",
    "knowledge base builder",
    "tech career growth",
    "AI job search",
    "resume analysis",
    "mock interview AI",
    "career coaching AI",
    "software engineer career",
    "Ambitology",
  ],
  authors: [{ name: "Ambitology", url: BASE_URL }],
  creator: "Ambitology",
  publisher: "Ambit Technology Group, L.L.C.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Ambitology",
    title: "Ambitology | AI-Powered Career Platform for Tech Professionals",
    description:
      "Build your knowledge base, craft AI-tailored resumes, score your career fit, and prepare for interviews — all powered by intelligent AI agents.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ambitology — AI-Powered Career Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ambitology | AI-Powered Career Platform for Tech Professionals",
    description:
      "Build your knowledge base, craft AI-tailored resumes, score your career fit, and prepare for interviews — all powered by intelligent AI agents.",
    images: ["/images/og-image.png"],
    creator: "@ambitology",
    site: "@ambitology",
  },
  icons: {
    icon: "/images/atg-logo.svg",
    apple: "/images/atg-logo.svg",
    shortcut: "/images/atg-logo.svg",
  },
  verification: {
    google: "",   // Add Google Search Console verification token here
  },
  category: "technology",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Ambitology",
  legalName: "Ambit Technology Group, L.L.C.",
  url: BASE_URL,
  logo: `${BASE_URL}/images/atg-logo.svg`,
  description:
    "AI-powered career platform helping tech professionals build knowledge bases, craft resumes, analyze career fit, and prepare for interviews.",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: `${BASE_URL}/contact`,
  },
  sameAs: ["https://www.linkedin.com/company/ambitology/"],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Ambitology",
  url: BASE_URL,
  description:
    "AI-powered career platform for tech professionals — resume crafting, career fit analysis, and interview preparation.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const siteNavigationSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Ambitology Site Navigation",
  itemListElement: [
    {
      "@type": "SiteNavigationElement",
      position: 1,
      name: "Sign In / Dashboard",
      description:
        "Access your AI career tools — resume builder, career fit scoring, and mock interviews.",
      url: `${BASE_URL}/`,
    },
    {
      "@type": "SiteNavigationElement",
      position: 2,
      name: "Browse Tech Jobs",
      description:
        "Discover curated software engineering, AI, and data science job opportunities.",
      url: `${BASE_URL}/jobs`,
    },
    {
      "@type": "SiteNavigationElement",
      position: 3,
      name: "Our Mission",
      description:
        "How Ambitology uses AI to bridge the gap between talent and opportunity.",
      url: `${BASE_URL}/mission`,
    },
    {
      "@type": "SiteNavigationElement",
      position: 4,
      name: "Careers",
      description:
        "Join our team and help build the future of AI-powered career development.",
      url: `${BASE_URL}/careers`,
    },
    {
      "@type": "SiteNavigationElement",
      position: 5,
      name: "Contact",
      description:
        "Get in touch with the Ambitology team for questions and support.",
      url: `${BASE_URL}/contact`,
    },
  ],
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Ambitology",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: BASE_URL,
  description:
    "An end-to-end AI agent system that guides tech professionals from skill planning to resume crafting, career fit analysis, and interview preparation.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free tier available",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "8",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-2HVK989RQD"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-2HVK989RQD');
          `}
        </Script>
        <Script
          id="schema-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Script
          id="schema-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Script
          id="schema-software"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
        <Script
          id="schema-site-navigation"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNavigationSchema) }}
        />
      </head>
      <body className={`${inter.className} ${comfortaa.variable} ${orbitron.variable} ${lato.variable} ${nunito.variable} ${plusJakartaSans.variable}`}>{children}</body>
    </html>
  );
}
