import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Tech Jobs",
  description:
    "Discover curated software engineering, AI/ML, and data science jobs. Filter by role, stack, and experience level.",
  alternates: {
    canonical: "https://ambitology.com/jobs",
  },
  openGraph: {
    title: "Browse Tech Jobs | Ambitology",
    description:
      "Discover curated software engineering, AI/ML, and data science jobs. Filter by role, stack, and experience level.",
    url: "https://ambitology.com/jobs",
  },
  twitter: {
    title: "Browse Tech Jobs | Ambitology",
    description:
      "Discover curated software engineering, AI/ML, and data science jobs. Filter by role, stack, and experience level.",
  },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
