import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Mission",
  description:
    "Ambitology bridges the gap between tech talent and opportunity using AI-powered career tools — from resumes to interview prep.",
  alternates: {
    canonical: "https://ambitology.com/mission",
  },
  openGraph: {
    title: "Our Mission | Ambitology",
    description:
      "Ambitology bridges the gap between tech talent and opportunity using AI-powered career tools — from resumes to interview prep.",
    url: "https://ambitology.com/mission",
  },
  twitter: {
    title: "Our Mission | Ambitology",
    description:
      "Ambitology bridges the gap between tech talent and opportunity using AI-powered career tools — from resumes to interview prep.",
  },
};

export default function MissionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
