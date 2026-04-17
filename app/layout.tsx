import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sunday? 💕",
  description: "A very important question...",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
