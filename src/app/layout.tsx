import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "DevEverTools - Your Everyday Developer Tools",
  description:
    "A collection of practical developer utilities. Format JSON, encode data, generate UUIDs, decode JWTs, convert timestamps, and explore colors.",
  applicationName: "DevEverTools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <body className={jetbrainsMono.className}>{children}</body>
    </html>
  );
}