import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Desktop Client",
  description: "Electron Desktop Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}