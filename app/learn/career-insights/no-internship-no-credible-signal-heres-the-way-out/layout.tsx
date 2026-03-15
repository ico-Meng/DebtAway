import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "No Internship, So No Credible Signal. Here's the Way Out! | Ambitology",
  description:
    "Recruiters use internships as a trust signal. If you don't have one, here's how to manufacture a signal that's even more compelling — starting with hiring yourself.",
  alternates: {
    canonical: "https://ambitology.com/learn/career-insights/no-internship-no-credible-signal-heres-the-way-out",
  },
  openGraph: {
    title: "No Internship, So No Credible Signal. Here's the Way Out! | Ambitology",
    description:
      "Recruiters use internships as a trust signal. If you don't have one, here's how to manufacture a signal that's even more compelling — starting with hiring yourself.",
    url: "https://ambitology.com/learn/career-insights/no-internship-no-credible-signal-heres-the-way-out",
    images: [{ url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&auto=format&fit=crop&q=80", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "No Internship, So No Credible Signal. Here's the Way Out! | Ambitology",
    description: "No internship? Here's how to create a credible signal from scratch.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
