import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Broader Tech Stack or Deep Specialization? The AI-Era Answer | Ambitology",
  description:
    "Should you master one technology or spread across many? In the AI age, the answer is both — but horizontal expansion is now non-negotiable. Here's the strategic breakdown every engineer needs.",
  alternates: {
    canonical: "https://ambitology.com/learn/career-insights/broader-stack-vs-deep-specialization-in-the-ai-age",
  },
  openGraph: {
    title: "Broader Tech Stack or Deep Specialization? The AI-Era Answer | Ambitology",
    description:
      "Should you master one technology or spread across many? In the AI age, horizontal expansion is non-negotiable for both generalists and specialists. Here's the full breakdown.",
    url: "https://ambitology.com/learn/career-insights/broader-stack-vs-deep-specialization-in-the-ai-age",
    images: [{ url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&auto=format&fit=crop&q=80", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Broader Tech Stack or Deep Specialization? The AI-Era Answer | Ambitology",
    description: "Breadth vs. depth in tech? In the AI age, horizontal expansion is now non-negotiable for everyone.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
