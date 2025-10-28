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
  title: "Noir Playground",
  description: "Plataforma de juegos tipo Wordle con grupos y scoreboards.",
  icons: [
    { rel: "icon", url: "/favi-noir.png", sizes: "32x32" },
    { rel: "icon", url: "/favi-noir.png", sizes: "192x192" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[#0b0b0f] text-[#f4f4f5] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
