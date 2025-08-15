import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from '@/components/providers/query-provider'
import { Toaster } from '@/components/ui/sonner'
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

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
  return (
    <html lang="de">
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  )
}
