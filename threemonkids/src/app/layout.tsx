import type { Metadata } from "next";
import { Geist, Geist_Mono, Nanum_Myeongjo } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Used only by the Najeon service card. Korean webfonts are heavy, so this one is
// never preloaded — the card falls back to a system 명조 stack until it arrives.
const nanumMyeongjo = Nanum_Myeongjo({
  variable: "--font-nanum-myeongjo",
  weight: ["400", "700"],
  // `subsets` is deliberately omitted: next/font's metadata for this family lists
  // only "latin", and naming subsets would drop the hangul ranges. Omitting it
  // (legal because preload is off) pulls every unicode-range the family ships.
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Threemonkids",
    template: "%s — Threemonkids",
  },
  description:
    "Threemonkids is a product studio that builds what it wants to build.",
  metadataBase: new URL("https://threemonkids.com"),
  openGraph: {
    siteName: "Threemonkids",
    images: [{ url: "/og/og-default.jpg", width: 1200, height: 630 }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${nanumMyeongjo.variable} antialiased min-h-screen flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
