import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: "Astra — Genshin Character Showcase",
    template: "%s | Astra",
  },
  description:
    "A cinematic home for your Genshin Impact character showcase and builds.",
  applicationName: "Astra",
  openGraph: {
    title: "Astra — Genshin Character Showcase",
    description: "Your characters. Their stories. Every detail.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#10141d",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  );
}