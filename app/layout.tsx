import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google"; // ✅ Zostawiamy tylko Mono
import "./globals.css";
import Script from "next/script";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: 'swap', // To powstrzymuje błąd "Eliminate render-blocking resources"
});

export const metadata: Metadata = {
  title: "Marcin Molenda | Precyzyjne Systemy, Web & Mobile",
  description: "Dedykowane systemy i aplikacje webowe oparte o Next.js 16 i Supabase. Architektura bez kompromisów, od JDG po duże firmy. Szybkość ładowania < 1s.",
  keywords: ['tworzenie stron internetowych', 'programista Next.js', 'aplikacje webowe', 'aplikacje mobilne', 'developer Polska', 'optymalizacja SEO'],
  authors: [{ name: 'Marcin Molenda', url: 'https://molendadevelopment.pl' }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: 'https://molendadevelopment.pl',
  },
  openGraph: {
    title: 'Marcin Molenda | Strony i Aplikacje Web & Mobile',
    description: 'Dedykowane strony i aplikacje webowe w Next.js 16. Szybkość ładowania < 1s. Obsługa firm z całej Polski.',
    url: 'https://molendadevelopment.pl',
    siteName: 'Marcin Molenda Portfolio',
    locale: 'pl_PL',
    type: 'website',
    images: [{
      url: 'https://molendadevelopment.pl/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Marcin Molenda – Precyzyjne systemy webowe',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marcin Molenda | Precyzyjne Systemy Web & Mobile',
    description: 'Dedykowane systemy i aplikacje webowe oparte o Next.js 16.',
    images: ['https://molendadevelopment.pl/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [
      { rel: 'icon', url: '/android-chrome-192x192.png', sizes: '192x192' },
      { rel: 'icon', url: '/android-chrome-512x512.png', sizes: '512x512' },
    ]
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      {/* ✅ Zastosowanie fontu Mono na całym body */}
      <body suppressHydrationWarning className={`${geistMono.className} bg-zinc-950 text-zinc-50 antialiased overflow-x-hidden selection:bg-orange-500/30 selection:text-orange-200`}>
         {/* ✅ GTM — lazyOnload dla zachowania 100/100 Performance */}
         <Script
          id="gtm"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-K2TJZ899');`,
          }}
        />
        {/* JSON-LD dla usług profesjonalnych */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              "name": "Marcin Molenda Development",
              "image": "https://molendadevelopment.pl/og-image.jpg",
              "@id": "https://molendadevelopment.pl",
              "url": "https://molendadevelopment.pl",
              "telephone": "+48665430469",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Zduńska Wola",
                "addressCountry": "PL"
              },
              "serviceType": ["Strony Internetowe", "Aplikacje Webowe", "Aplikacje Mobilne", "Optymalizacja SEO"]
            })
          }}
        />

        {children}

       

        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-K2TJZ899"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
      </body>
    </html>
  );
}