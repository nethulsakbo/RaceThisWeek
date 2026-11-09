import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Race This Week | Major Motorsports Schedules, Live Sessions & Standings",
  description:
    "See all racing events happening in major motorsports this week on one single page. Formula 1, MotoGP, NASCAR, IndyCar, WEC, Formula E, WRC & IMSA schedules, live session timing, and championship standings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-zinc-50 dark:bg-zinc-950 min-h-screen">
        {children}
      </body>
    </html>
  );
}

