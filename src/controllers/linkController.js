import { linkSchema } from "../schemas/linkSchema.js";
import { createLink } from "../services/linkService.js";

export async function linkController (req, res, next) {
    try {
        const validated = linkSchema.parse(req.body)

        const link = await createLink(validated.target_url)

        res.status(201).json(link)
    } catch (error) {
        next(error)
    }
}