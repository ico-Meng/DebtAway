import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join the Ambitology team and help build the future of AI-powered career development. Explore open roles and opportunities at Ambitology.",
  alternates: {
    canonical: "https://ambitology.com/careers",
  },
  openGraph: {
    title: "Careers | Ambitology",
    description:
      "Join the Ambitology team and help build the future of AI-powered career development. Explore open roles and opportunities.",
    url: "https://ambitology.com/careers",
  },
  twitter: {
    title: "Careers | Ambitology",
    description:
      "Join the Ambitology team and help build the future of AI-powered career development. Explore open roles and opportunities.",
  },
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
