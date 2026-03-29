import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Emotional Burnout from Repeated Rejection in Job Search | Ambitology",
  description:
    "Hundreds of applications, near-zero callbacks, zero feedback. Job search burnout is real — but it's also manageable. Here's a strategic, data-backed guide to staying resilient and getting hired.",
  alternates: {
    canonical: "https://ambitology.com/learn/career-insights/emotional-burnout-from-repeated-rejection",
  },
  openGraph: {
    title: "Emotional Burnout from Repeated Rejection in Job Search | Ambitology",
    description:
      "Hundreds of applications, near-zero callbacks, zero feedback. Job search burnout is real — but it's also manageable. Here's a strategic, data-backed guide to staying resilient and getting hired.",
    url: "https://ambitology.com/learn/career-insights/emotional-burnout-from-repeated-rejection",
    images: [
      {
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "Data dashboard representing job search analytics and resilience strategy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Emotional Burnout from Repeated Rejection in Job Search | Ambitology",
    description:
      "Hundreds of applications, near-zero callbacks, zero feedback. Job search burnout is real — but it's also manageable. Here's a strategic, data-backed guide to staying resilient and getting hired.",
  },
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
