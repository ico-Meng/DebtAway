import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Insights | Ambitology",
  description:
    "Expert articles on navigating the modern tech career — from AI disruption to system architecture, leadership, and staying competitive.",
  alternates: {
    canonical: "https://ambitology.com/learn/career-insights",
  },
  openGraph: {
    title: "Career Insights | Ambitology",
    description:
      "Expert articles on navigating the modern tech career — from AI disruption to system architecture, leadership, and staying competitive.",
    url: "https://ambitology.com/learn/career-insights",
  },
  twitter: {
    title: "Career Insights | Ambitology",
    description:
      "Expert articles on navigating the modern tech career — from AI disruption to system architecture, leadership, and staying competitive.",
  },
};

export default function CareerInsightsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
