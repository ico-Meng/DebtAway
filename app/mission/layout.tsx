import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Mission",
  description:
    "Learn about Ambitology's mission to close the gap between exceptional technical talent and great career opportunities using AI-powered tools.",
  alternates: {
    canonical: "https://ambitology.com/mission",
  },
  openGraph: {
    title: "Our Mission | Ambitology",
    description:
      "Learn about Ambitology's mission to close the gap between exceptional technical talent and great career opportunities using AI-powered tools.",
    url: "https://ambitology.com/mission",
  },
  twitter: {
    title: "Our Mission | Ambitology",
    description:
      "Learn about Ambitology's mission to close the gap between exceptional technical talent and great career opportunities using AI-powered tools.",
  },
};

export default function MissionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
