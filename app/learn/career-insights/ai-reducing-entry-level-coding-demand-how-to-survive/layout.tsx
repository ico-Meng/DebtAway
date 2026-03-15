import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Reducing Entry-Level Coding Demand. How to Survive? | Ambitology",
  description:
    "AI coding tools are automating entry-level work at speed. But engineering is far bigger than code. Learn how to reposition yourself as a high-value engineer in the age of AI.",
  alternates: {
    canonical: "https://ambitology.com/learn/career-insights/ai-reducing-entry-level-coding-demand-how-to-survive",
  },
  openGraph: {
    title: "AI Reducing Entry-Level Coding Demand. How to Survive? | Ambitology",
    description:
      "AI coding tools are automating entry-level work at speed. But engineering is far bigger than code. Learn how to reposition yourself as a high-value engineer in the age of AI.",
    url: "https://ambitology.com/learn/career-insights/ai-reducing-entry-level-coding-demand-how-to-survive",
    images: [{ url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Reducing Entry-Level Coding Demand. How to Survive? | Ambitology",
    description: "AI is shrinking entry-level demand. Here's how to survive and thrive.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
