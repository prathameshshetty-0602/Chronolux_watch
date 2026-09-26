import type { Metadata } from "next";
import { StoreProviders } from "@/components/store-providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "@/app/globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://chronolux.example";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ChronoLux — Time, Engineered for You.",
    template: "%s | ChronoLux",
  },
  description: "Discover considered smart, mechanical and everyday watches at ChronoLux. Time, engineered for you.",
  openGraph: {
    type: "website",
    siteName: "ChronoLux",
    title: "ChronoLux — Time, Engineered for You.",
    description: "Discover considered watches designed to move with you.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChronoLux — Time, Engineered for You.",
    description: "Discover considered watches designed to move with you.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <StoreProviders>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </StoreProviders>
      </body>
    </html>
  );
}
