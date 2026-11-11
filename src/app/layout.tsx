import type { Metadata, Viewport } from "next";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://your-username.github.io/RaceThisWeek";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Race This Week | Major Motorsport Schedules, Live Sessions & Standings",
    template: "%s | Race This Week",
  },
  description:
    "See all racing events happening in major motorsports this week on one single page. Formula 1, MotoGP, NASCAR, IndyCar, WEC, Formula E, WRC & IMSA schedules, live session timing, and championship standings.",
  keywords: [
    "motorsport schedule",
    "F1 schedule this week",
    "Formula 1",
    "MotoGP",
    "NASCAR",
    "IndyCar",
    "WEC",
    "Formula E",
    "WRC",
    "IMSA",
    "live racing",
  ],
  authors: [{ name: "Race This Week" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Race This Week",
    title: "Race This Week — Major Motorsport Schedules & Standings",
    description:
      "All major motorsport events this week in one single view: F1, MotoGP, NASCAR, IndyCar, WEC, Formula E, WRC & IMSA.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Race This Week — Major Motorsport Hub",
    description:
      "All major motorsport events this week: schedules in local time, live session timing and championship standings.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* No-flash theme script: applies theme class before browser paints */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark');}else if(t==='dark'){document.documentElement.classList.add('dark');}else if(window.matchMedia('(prefers-color-scheme: light)').matches){document.documentElement.classList.remove('dark');}else{document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SportsEvent",
              "name": "Race This Week Motorsports Hub",
              "description": "Weekly motorsport schedules, session timings, and standings for F1, MotoGP, NASCAR, IndyCar, WEC, Formula E, WRC and IMSA.",
              "url": BASE_URL,
              "organizer": {
                "@type": "Organization",
                "name": "Race This Week",
                "url": BASE_URL,
              },
            }),
          }}
        />
      </head>
      <body className="antialiased bg-zinc-50 dark:bg-zinc-950 min-h-screen">
        {children}
      </body>
    </html>
  );
}
