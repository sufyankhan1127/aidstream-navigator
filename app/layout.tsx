import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AidStream Navigator",
  description: "AI-Powered Welfare Discovery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={outfit.className + " bg-gray-50 text-gray-900 antialiased"}>
        {children}
      </body>
    </html>
  );
}
