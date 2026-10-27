import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mncglobalconnect.com"),
  title: {
    default: "MNC Global Connect | Business Connections Without Borders",
    template: "%s | MNC Global Connect",
  },
  description:
    "Build meaningful international business connections through qualified introductions, B2B meetings, trade opportunities, events, and global market access.",
  openGraph: {
    title: "MNC Global Connect",
    description:
      "Connecting businesses to meaningful global opportunities, partnerships, and international markets.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body>{children}</body>
    </html>
  );
}
