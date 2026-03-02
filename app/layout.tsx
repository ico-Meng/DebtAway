import type { Metadata } from "next";
import { Inter, Comfortaa, Orbitron, Lato, Nunito, Plus_Jakarta_Sans } from "next/font/google";
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
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["800", "900"],
  variable: "--font-nunito",
});
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "Ambitology",
  description: "Ambitology is a platform that helps you build knowledge and skills to advance your career.",
  icons: {
    icon: "/images/atg-logo.svg",
    apple: "/images/atg-logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${comfortaa.variable} ${orbitron.variable} ${lato.variable} ${nunito.variable} ${plusJakartaSans.variable}`}>{children}</body>
    </html>
  );
}
