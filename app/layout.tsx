import type { Metadata } from "next";
import { Inter, Comfortaa, Orbitron, Lato } from "next/font/google";
import "./app.css";

const inter = Inter({ subsets: ["latin"] });
const comfortaa = Comfortaa({ 
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-comfortaa",
});
const orbitron = Orbitron({ 
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-orbitron",
});
const lato = Lato({ 
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-lato",
});

export const metadata: Metadata = {
  title: "Ambitology",
  description: "Ambitology is a platform that helps you build knowledge and skills to advance your career.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${comfortaa.variable} ${orbitron.variable} ${lato.variable}`}>{children}</body>
    </html>
  );
}
