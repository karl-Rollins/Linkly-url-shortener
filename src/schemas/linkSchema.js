import { z } from "zod";

export const linkSchema = z.object({
    target_url: z.url(),
})