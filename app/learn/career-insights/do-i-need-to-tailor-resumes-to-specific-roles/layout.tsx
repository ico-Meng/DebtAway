import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Do I Need to Tailor Resumes to Specific Roles? Here's an Easy Way! | Ambitology",
  description:
    "Tailoring your resume to every job feels like impossible manual work — but in the AI era, it's more important than ever. Here's why precision-targeted resumes win, and the smarter way to do it.",
  keywords: [
    "tailor resume to job",
    "resume tailoring tips",
    "how to customize resume",
    "AI resume tailoring",
    "resume for specific role",
    "software engineer resume tips",
    "job application strategy",
    "resume keyword matching",
    "Ambitology knowledge base",
    "resume in AI era",
    "ATS optimization",
    "technical resume customization",
  ],
  openGraph: {
    title: "Do I Need to Tailor Resumes to Specific Roles? Here's an Easy Way!",
    description:
      "In the AI age, your skills grow faster than any single resume can capture. Here's why precision-tailored resumes matter more than ever — and how to do it without burning hours.",
    url: "https://ambitology.com/learn/career-insights/do-i-need-to-tailor-resumes-to-specific-roles",
    type: "article",
    publishedTime: "2026-03-14T00:00:00.000Z",
    images: [
      {
        url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "Tailoring a resume to a specific job role — strategy and precision",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Do I Need to Tailor Resumes to Specific Roles? Here's an Easy Way!",
    description:
      "Your skills outpace any single resume. Here's the smarter, AI-era strategy for precision-targeting every application.",
    images: [
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop&q=80",
    ],
  },
  alternates: {
    canonical:
      "https://ambitology.com/learn/career-insights/do-i-need-to-tailor-resumes-to-specific-roles",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
