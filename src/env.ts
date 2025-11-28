import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    HOST_NAME: z.string().min(1),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("production"),
    DATABASE_URL: z.string().min(1),
    DATABASE_URL_DIRECT: z.string().min(1),

    FILE_STORAGE_CDN_URL: z.string().optional(),
    FILE_STORAGE_ENDPOINT: z.string().min(1),
    FILE_STORAGE_ACCESS_KEY: z.string().min(1),
    FILE_STORAGE_SECRET_KEY: z.string().min(1),
    FILE_STORAGE_BUCKET: z.string().min(1),
    FILE_STORAGE_REGION: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_MAPBOX_TOKEN: z.string().min(1),
  },
  runtimeEnv: {
    HOST_NAME: process.env.HOST_NAME,
    NODE_ENV: process.env.NODE_ENV || "production",
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_DIRECT: process.env.DATABASE_URL_DIRECT,

    FILE_STORAGE_CDN_URL: process.env.FILE_STORAGE_CDN_URL,
    FILE_STORAGE_ENDPOINT: process.env.FILE_STORAGE_ENDPOINT,
    FILE_STORAGE_ACCESS_KEY: process.env.FILE_STORAGE_ACCESS_KEY,
    FILE_STORAGE_SECRET_KEY: process.env.FILE_STORAGE_SECRET_KEY,
    FILE_STORAGE_BUCKET: process.env.FILE_STORAGE_BUCKET,
    FILE_STORAGE_REGION: process.env.FILE_STORAGE_REGION,

    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  },
});
