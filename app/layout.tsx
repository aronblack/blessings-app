import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Daily Blessings - Receive a Blessing",
  description: "Receive personalized daily blessings to inspire and uplift your spirit.",
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:3000'),
  openGraph: {
    title: "Daily Blessings - Receive a Blessing",
    description: "Receive personalized daily blessings to inspire and uplift your spirit.",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Daily Blessings App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Blessings - Receive a Blessing",
    description: "Receive personalized daily blessings to inspire and uplift your spirit.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
