import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers at Ambitology",
  description:
    "Join a small team building AI-driven career tools. See open roles and apply to work at Ambitology.",
  alternates: {
    canonical: "https://ambitology.com/careers",
  },
  openGraph: {
    title: "Careers at Ambitology",
    description:
      "Join a small team building AI-driven career tools. See open roles and apply to work at Ambitology.",
    url: "https://ambitology.com/careers",
  },
  twitter: {
    title: "Careers at Ambitology",
    description:
      "Join a small team building AI-driven career tools. See open roles and apply to work at Ambitology.",
  },
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
