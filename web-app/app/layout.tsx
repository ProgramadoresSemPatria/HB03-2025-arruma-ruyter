import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { RouteProtector } from "@/components/auth/RouteProtector";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Unvibe - Your Intelligent Security Assistant",
  description: "AI-powered bot to help you review, secure, and ship code with confidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-gray-950 text-gray-50`}
      >
        <RouteProtector>
          {children}
        </RouteProtector>
      </body>
    </html>
  );
}
