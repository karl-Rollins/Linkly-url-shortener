import dotenv from "dotenv";
import{ z } from "zod";
import { logger } from "../utils/logger.js";

dotenv.config({
  path:
    process.env.NODE_ENV === "test"
      ? ".env.test"
      : ".env",
});

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"])
                .default("development"),
    
    PORT: z.coerce.number().int().positive(),
    DB_HOST: z.string().min(1),
    DB_PORT: z.coerce.number().int().positive(),
    DB_NAME: z.string().min(1),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().min(1)
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
    logger.error("invalid environment variables")
    logger.fatal(parsed.error.flatten)

    process.exit(1)
}

export const env = parsed.data