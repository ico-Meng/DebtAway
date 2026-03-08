import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Board",
  description:
    "Browse and apply to curated tech job listings on Ambitology. Find software engineering, data science, and AI roles matched to your skills.",
  alternates: {
    canonical: "https://ambitology.com/jobs",
  },
  openGraph: {
    title: "Job Board | Ambitology",
    description:
      "Browse and apply to curated tech job listings on Ambitology. Find software engineering, data science, and AI roles matched to your skills.",
    url: "https://ambitology.com/jobs",
  },
  twitter: {
    title: "Job Board | Ambitology",
    description:
      "Browse and apply to curated tech job listings on Ambitology. Find software engineering, data science, and AI roles matched to your skills.",
  },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
