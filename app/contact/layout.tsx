import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Ambitology team. We're here to help with questions about our AI career platform, partnerships, and support.",
  alternates: {
    canonical: "https://ambitology.com/contact",
  },
  openGraph: {
    title: "Contact Us | Ambitology",
    description:
      "Get in touch with the Ambitology team. We're here to help with questions about our AI career platform, partnerships, and support.",
    url: "https://ambitology.com/contact",
  },
  twitter: {
    title: "Contact Us | Ambitology",
    description:
      "Get in touch with the Ambitology team. We're here to help with questions about our AI career platform, partnerships, and support.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
