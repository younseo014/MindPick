import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MindPick Demo",
  description: "Smartwatch-connected cognitive care game demo.",
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
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
