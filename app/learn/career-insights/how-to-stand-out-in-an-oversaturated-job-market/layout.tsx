import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Stand Out in an Oversaturated Job Market | Ambitology",
  description:
    "The tech job market is flooded with talent and short on openings. Here's a data-backed playbook: build real working experience, target the right companies, and tailor every application to beat the competition.",
  alternates: {
    canonical: "https://ambitology.com/learn/career-insights/how-to-stand-out-in-an-oversaturated-job-market",
  },
  openGraph: {
    title: "How to Stand Out in an Oversaturated Job Market | Ambitology",
    description:
      "The tech job market is flooded with talent and short on openings. Here's a data-backed playbook: build real working experience, target the right companies, and tailor every application to beat the competition.",
    url: "https://ambitology.com/learn/career-insights/how-to-stand-out-in-an-oversaturated-job-market",
    images: [{ url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&auto=format&fit=crop&q=80", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Stand Out in an Oversaturated Job Market | Ambitology",
    description: "The tech job market is flooded with talent. Here's the playbook to rise above.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
