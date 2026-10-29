import { linkSchema } from "../schemas/linkSchema.js";
import { createLink } from "../services/linkService.js";
import { redirectToLink } from "../services/linkService.js";
import { getLinkByCode } from "../services/linkService.js";

export async function linkController (req, res, next) {
    try {
        const validated = linkSchema.parse(req.body)

        const link = await createLink(validated.target_url)

        res.status(201).json(link)
    } catch (error) {
        next(error)
    }
}

export async function redirectController (req, res, next) {
    try {
        const { code } = req.params

        const link = await redirectToLink (
            code,
            req.get("referrer") || null,
            req.get("user_agent") || null
        )

        if (!link) {
            return res.status(404).json({
                error: "link not found"
            })
        }

        return res.redirect(link.target_url)

    } catch (error) {
        next(error)
    }
}

export async function getLinkController (req, res, next) {
    try {
        const { code } = req.params

        const link = await getLinkByCode(code)

        if (!link) {
            return res.status(404).json({
                error: "link not found",
            })
        }

        return res.json(link)
        
    } catch (error) {
        next(error)
    }
}