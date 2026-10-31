import { z } from "zod";

export const linkSchema = z.object({
    target_url: z.url(),

    code: z.string()
            .min(3)
            .max(16)
            .regex(/^[A-Za-z0-9_-]+$/,
                "code may contain letters, numbers, hyphens, and underscores only"
            )
            .optional(),

    expires_at: z.iso
                 .datetime()
                 .optional()
                 .refine(
                    (date) => new Date(date) > new Date(),
                    {
                        message: "Expiration date must be in the future",
                    }
                 )
})
