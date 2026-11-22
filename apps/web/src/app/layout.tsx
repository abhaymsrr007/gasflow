import type { Metadata } from "next";
// import "./globals.css";
import "../app/globals.css"

export const metadata: Metadata = {
  title: "GASFlow",
  description: "Commercial LPG Agency Management Platform"
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
