// env.mjs
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    ANALYZE: z
      .enum(["true", "false"])
      .optional()
      .default("false")
      .transform((v) => v === "true"),

    // URL du backend HTTP exposé au frontend
    NEXT_PUBLIC_API_BASE: z.string().url().default("http://localhost:8000"),
  },

  client: {
    // exposé au navigateur
    NEXT_PUBLIC_API_BASE: z.string().url().default("http://localhost:8000"),
  },

  runtimeEnv: {
    ANALYZE: process.env.ANALYZE,
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
  },
});
