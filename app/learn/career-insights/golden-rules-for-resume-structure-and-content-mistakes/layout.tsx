import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Golden Rules for Resume Structure: The Content Mistakes That Kill Great Candidates | Ambitology",
  description:
    "Most candidates lose before a human reads their resume. Understand how HR, engineers, and hiring managers each evaluate the same document — and how to structure your content to pass all three filters.",
  keywords: [
    "resume structure",
    "resume content mistakes",
    "ATS resume tips",
    "technical resume guide",
    "software engineer resume",
    "how to write a resume",
    "resume for engineering jobs",
    "hiring process resume",
    "engineering manager resume",
    "resume keyword strategy",
  ],
  openGraph: {
    title: "Golden Rules for Resume Structure: The Content Mistakes That Kill Great Candidates",
    description:
      "HR sees keywords. Engineers probe depth. Managers look for fit. One resume, three completely different readers. Here's how to write for all of them.",
    url: "https://ambitology.com/learn/career-insights/golden-rules-for-resume-structure-and-content-mistakes",
    type: "article",
    publishedTime: "2026-03-12T00:00:00.000Z",
    images: [
      {
        url: "https://ambitology.com/images/resume-critique.jpg",
        width: 1200,
        height: 630,
        alt: "Resume structure and content strategy guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Golden Rules for Resume Structure & Content Mistakes",
    description:
      "HR, engineers, and managers all read your resume differently. Structure your content to win all three filters.",
    images: ["https://ambitology.com/images/resume-critique.jpg"],
  },
  alternates: {
    canonical:
      "https://ambitology.com/learn/career-insights/golden-rules-for-resume-structure-and-content-mistakes",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
