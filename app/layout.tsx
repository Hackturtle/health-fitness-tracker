import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fitness OS",
  description: "Training, nutrition, sleep and progress. Your personal fitness dashboard.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
