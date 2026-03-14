import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Reach the Ambitology team with questions, feedback, or partnership inquiries.",
  alternates: {
    canonical: "https://ambitology.com/contact",
  },
  openGraph: {
    title: "Contact Us | Ambitology",
    description:
      "Reach the Ambitology team with questions, feedback, or partnership inquiries.",
    url: "https://ambitology.com/contact",
  },
  twitter: {
    title: "Contact Us | Ambitology",
    description:
      "Reach the Ambitology team with questions, feedback, or partnership inquiries.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
