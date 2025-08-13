import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Check if we have valid Clerk keys
const hasValidClerkKeys = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_') && 
                         process.env.CLERK_SECRET_KEY?.startsWith('sk_') && 
                         !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('your_clerk_publishable_key_here')

export const metadata: Metadata = {
  title: "Badezeit Sylt - Restaurant am Meer",
  description: "Genießen Sie exquisite Küche mit atemberaubendem Meerblick auf Sylt. Reservieren Sie Ihren Tisch im Badezeit Restaurant für unvergessliche kulinarische Erlebnisse.",
  keywords: "Restaurant Sylt, Meerblick Restaurant, Sylter Küche, Reservierung, Seafood, Fine Dining, Badezeit",
  authors: [{ name: "Badezeit Sylt Team" }],
  openGraph: {
    title: "Badezeit Sylt - Restaurant am Meer",
    description: "Exquisite Küche mit Meerblick auf Sylt",
    type: "website",
    locale: "de_DE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <html lang="de">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )

  // Only use ClerkProvider if we have valid keys
  if (hasValidClerkKeys) {
    return (
      <ClerkProvider>
        {content}
      </ClerkProvider>
    );
  }

  return content;
}
