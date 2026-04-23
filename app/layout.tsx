import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_NAME = "TankhwaMeter";
const DEFAULT_TITLE = "TankhwaMeter — Know Your Worth in Pakistan";
const DEFAULT_DESCRIPTION =
  "Anonymous salary data from real Pakistani professionals. " +
  "Compare salaries for any job in Karachi, Lahore, Islamabad and more.";

export const metadata: Metadata = {
  title: {
    default: DEFAULT_TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "pakistan salary",
    "pakistan jobs salary",
    "karachi salary",
    "lahore salary",
    "software engineer salary pakistan",
  ],
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    type: "website",
    siteName: SITE_NAME,
    locale: "en_PK",
  },
  twitter: {
    card: "summary",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Navbar />
        <main className="flex-1 pt-16 animate-page">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
