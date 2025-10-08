import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Typing Digital - Practice Your Typing Speed',
  description: 'Improve your typing speed with Typing Digital. Track your WPM, compete on the leaderboard, and become a faster typist!',
  openGraph: {
    title: 'Typing Digital - Practice Your Typing Speed',
    description: 'I can type X words per minute. Are you faster? Test your typing speed and compare the result with your friends.',
    url: 'https://typing.sheakh.digital',
    siteName: 'Typing Digital',
    images: [
      {
        url: 'https://typing.sheakh.digital/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Typing Digital - Test Your Typing Speed',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Typing Digital - Practice Your Typing Speed',
    description: 'Test your typing speed and compete with others!',
    images: ['https://typing.sheakh.digital/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
