import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Too Few True Entry-Level Openings? Here's the Way Out! | Ambitology",
  description:
    "The entry-level tech job market is broken. Here's a proven playbook: register a real company, ship a product with AI tools, get paying users, and walk into interviews as a founder — not a fresh grad.",
  alternates: {
    canonical: "https://ambitology.com/learn/career-insights/too-few-entry-level-openings-heres-the-way-out",
  },
  openGraph: {
    title: "Too Few True Entry-Level Openings? Here's the Way Out! | Ambitology",
    description:
      "The entry-level tech job market is broken. Here's a proven playbook: register a real company, ship a product with AI tools, get paying users, and walk into interviews as a founder — not a fresh grad.",
    url: "https://ambitology.com/learn/career-insights/too-few-entry-level-openings-heres-the-way-out",
    images: [
      {
        url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "Laptop with code - entry level job market",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Too Few True Entry-Level Openings? Here's the Way Out! | Ambitology",
    description:
      "The entry-level tech job market is broken. Here's a proven playbook: register a real company, ship a product with AI tools, get paying users, and walk into interviews as a founder — not a fresh grad.",
  },
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
