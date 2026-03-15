import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Difficulty Translating Projects into Resume Bullets? Here's How! | Ambitology",
  description:
    "Spent weeks building a project but can't turn it into compelling résumé bullets? There's a four-component formula that solves this — and it works for every technical project, every time.",
  alternates: {
    canonical: "https://ambitology.com/learn/career-insights/how-to-translate-projects-into-resume-bullets",
  },
  openGraph: {
    title: "Difficulty Translating Projects into Resume Bullets? Here's How! | Ambitology",
    description:
      "There's a four-component formula for turning any technical project into a compelling résumé bullet. Here's exactly how it works — with before/after examples.",
    url: "https://ambitology.com/learn/career-insights/how-to-translate-projects-into-resume-bullets",
    images: [{ url: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&auto=format&fit=crop&q=80", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Difficulty Translating Projects into Resume Bullets? Here's How! | Ambitology",
    description: "The four-component formula for turning any technical project into a résumé bullet that gets interviews.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
