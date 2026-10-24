import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable gzip and brotli compression for all text and JSON payloads
  compress: true,

  // Remove the X-Powered-By: Next.js header for security & byte conservation
  poweredByHeader: false,

  // Advanced HTTP Cache-Control headers
  async headers() {
    return [
      {
        // Immutable long-term caching for static webpack/Next.js JS & CSS chunks
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Long-term caching for static images, icons, fonts and logos
        source: "/:all*(ico|png|jpg|jpeg|svg|webp|woff2|woff)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Dynamic HTML routes: instant delivery with background revalidation
        source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
