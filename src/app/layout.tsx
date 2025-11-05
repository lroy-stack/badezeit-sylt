import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from '@/components/providers/query-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { FloatingThemeToggle } from '@/components/floating-theme-toggle'
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
    <html lang="de" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute={["class", "data-theme"]}
          defaultTheme="coral"
          enableSystem={false}
          disableTransitionOnChange
          themes={["light", "dark", "coral", "ocean", "forest", "sunset", "midnight"]}
          storageKey="badezeit-theme"
        >
          <QueryProvider>
            {children}
            <FloatingThemeToggle />
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
