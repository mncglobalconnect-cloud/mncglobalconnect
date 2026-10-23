import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
