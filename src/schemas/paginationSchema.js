import { z } from "zod";

export const paginationSchema = z.object({
    after: z.coerce
            .number()
            .int()
            .positive()
            .optional(),

    limit: z.coerce
            .number()
            .int()
            .positive()
            .max(100)
            .default(20),
})