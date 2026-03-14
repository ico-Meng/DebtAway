import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Stay Competitive in the Fast-Moving AI Era | Ambitology",
  description:
    "AI tools can now write code in seconds. But engineering is far more than typing syntax. Discover what skills and mindsets will keep you competitive as automation rises.",
  alternates: {
    canonical: "https://ambitology.com/learn/career-insights/how-to-stay-competitive-in-the-fast-moving-ai-era",
  },
  openGraph: {
    title: "How to Stay Competitive in the Fast-Moving AI Era | Ambitology",
    description:
      "AI tools can now write code in seconds. But engineering is far more than typing syntax. Discover what skills and mindsets will keep you competitive as automation rises.",
    url: "https://ambitology.com/learn/career-insights/how-to-stay-competitive-in-the-fast-moving-ai-era",
    images: [
      {
        url: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&auto=format&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "AI and engineering in the modern era",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Stay Competitive in the Fast-Moving AI Era | Ambitology",
    description:
      "AI tools can now write code in seconds. But engineering is far more than typing syntax. Discover what skills and mindsets will keep you competitive as automation rises.",
  },
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
