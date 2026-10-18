import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#030712"
};

export const metadata: Metadata = {
  title: "DevFix AI - AI-Powered DevOps Troubleshooting Assistant",
  description: "Diagnose Kubernetes, Docker, Jenkins, Linux, Terraform, and AWS infrastructure errors quickly using open-weight AI and local Ollama inference without expensive proprietary APIs.",
  keywords: ["DevOps", "Troubleshooting", "AI", "Ollama", "Open-Weight", "Kubernetes", "Docker", "SRE", "Infrastructure"],
  authors: [{ name: "DevFix AI Team" }]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
