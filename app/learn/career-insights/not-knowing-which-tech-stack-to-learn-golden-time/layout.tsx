import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not Knowing Which Tech Stack to Learn? Now It Is Your Golden Time! | Ambitology",
  description:
    "Unsure which technology to specialize in? In the AI era, broad architectural thinking beats narrow specialization. Here's how to turn that uncertainty into your greatest career advantage.",
  alternates: {
    canonical: "https://ambitology.com/learn/career-insights/not-knowing-which-tech-stack-to-learn-golden-time",
  },
  openGraph: {
    title: "Not Knowing Which Tech Stack to Learn? Now It Is Your Golden Time! | Ambitology",
    description:
      "Unsure which technology to specialize in? In the AI era, broad architectural thinking beats narrow specialization. Here's how to turn that uncertainty into your greatest career advantage.",
    url: "https://ambitology.com/learn/career-insights/not-knowing-which-tech-stack-to-learn-golden-time",
    images: [{ url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Not Knowing Which Tech Stack to Learn? Now It Is Your Golden Time! | Ambitology",
    description: "Not sure which tech stack to learn? That uncertainty is actually your edge in the AI age.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
