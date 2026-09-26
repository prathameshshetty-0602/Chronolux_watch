import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://chronolux.example";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/account/", "/orders/", "/admin/", "/checkout/"] }],
    sitemap: siteUrl + "/sitemap.xml",
  };
}
