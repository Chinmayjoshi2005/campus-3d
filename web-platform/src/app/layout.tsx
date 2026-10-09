import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/header";
import { PageTheme } from "@/components/layout/page-theme";
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
  title: "Campus Guide 3D",
  description:
    "Interactive 3D digital twin of the college campus. Search faculty, explore rooms, navigate in real-time.",
  keywords: ["campus", "3D", "navigation", "faculty", "college"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Suspense fallback={null}>
          <PageTheme />
        </Suspense>
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        <div className="page-wrapper">{children}</div>
      </body>
    </html>
  );
}
