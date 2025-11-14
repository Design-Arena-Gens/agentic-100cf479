import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Neon Reverie",
  description:
    "Cinematic cyberpunk tableau of a young woman drifting through a neon-lit street, captured in luminous slow motion.",
  metadataBase: new URL("https://agentic-100cf479.vercel.app"),
  openGraph: {
    title: "Neon Reverie",
    description:
      "Cinematic cyberpunk tableau of a young woman drifting through a neon-lit night street with wet pavement reflections.",
    url: "https://agentic-100cf479.vercel.app",
    siteName: "Neon Reverie",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Neon Reverie",
    description:
      "Cinematic cyberpunk tableau of a young woman drifting through a neon-lit night street with wet pavement reflections.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
