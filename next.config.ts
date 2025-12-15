import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";
import "@/env";

function urlOriginAsRemotePattern(url: string): RemotePattern {
  const parsed = new URL(url);
  return {
    protocol: parsed.protocol === "http:" ? "http" : "https",
    hostname: parsed.hostname,
    port: parsed.port,
  };
}

const s3Pattern = urlOriginAsRemotePattern(
  process.env.FILE_STORAGE_CDN_URL ||
    process.env.FILE_STORAGE_ENDPOINT ||
    "https://localhost",
);

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      // S3 - File Storage
      s3Pattern,
    ],
    // Allow localhost requests if the S3 pattern requires it
    dangerouslyAllowLocalIP: s3Pattern.hostname === "localhost",
  },
};

export default nextConfig;
