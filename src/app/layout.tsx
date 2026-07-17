import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://dondeveolafinal.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "¿Dónde Ver la Final? | Encuentra bares y pubs para ver el Mundial",
    template: "%s | Dónde Ver la Final",
  },
  description:
    "Encontrá dónde ver la final del Mundial 2026 en Argentina y en todo el mundo. Mapa interactivo con bares, pubs y locales cerca tuyo. ¡Sumá el tuyo!",
  keywords: [
    "donde ver la final",
    "final mundial 2026",
    "ver el mundial en argentina",
    "donde mirar la final",
    "bares para ver el mundial",
    "pubs futbol",
    "donde ver el partido",
    "final copa del mundo",
    "argentina final",
    "screening mundial",
    "world cup final bars",
    "where to watch world cup",
    "mundial 2026 screenings",
    "donde ver la final en nueva zelanda",
    "donde mirar la final en australia",
    "donde ver el mundial en europa",
    "final mundial bar cercano",
  ],
  authors: [{ name: "Donde Ver La Final" }],
  creator: "Donde Ver La Final",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: SITE_URL,
    siteName: "Dónde Ver La Final",
    title: "¿Dónde Ver la Final? | Mapa de bares y pubs para ver el Mundial",
    description:
      "Encontrá dónde ver la final del Mundial 2026 en Argentina y en todo el mundo. Mapa interactivo con bares, pubs y locales cerca tuyo.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Dónde Ver la Final - Mapa para ver el Mundial en Argentina y el mundo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "¿Dónde Ver la Final? | Mapa de bares y pubs para ver el Mundial",
    description:
      "Encontrá dónde ver la final del Mundial 2026 en Argentina y en todo el mundo. Mapa interactivo con bares, pubs y locales cerca tuyo.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-AR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Dónde Ver La Final",
              url: SITE_URL,
              description:
                "Encontrá dónde ver la final del Mundial 2026 en Argentina y en todo el mundo. Mapa interactivo con bares, pubs y locales cerca tuyo.",
              applicationCategory: "EntertainmentApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "ARS",
              },
              inLanguage: "es-AR",
              about: {
                "@type": "Event",
                name: "Final de la Copa del Mundo FIFA 2026",
                startDate: "2026-07-19T19:00:00Z",
                location: {
                  "@type": "Place",
                  name: "Estadio MetLife",
                  address: {
                    "@type": "PostalAddress",
                    addressCountry: "US",
                    addressRegion: "NJ",
                  },
                },
                organizer: {
                  "@type": "Organization",
                  name: "FIFA",
                },
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
