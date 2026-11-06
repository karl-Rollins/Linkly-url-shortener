import { linkSchema } from "../schemas/linkSchema.js";
import { createLink } from "../services/linkService.js";
import { redirectToLink } from "../services/linkService.js";
import { getLinkByCode } from "../services/linkService.js";
import { getClicksByCode } from "../services/linkService.js";
import { deleteLink } from "../services/linkService.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ValidationError } from "../errors/ValidationError.js";
import { paginationSchema } from "../schemas/paginationSchema.js";
import { getClicksForExport } from "../services/linkService.js";

//eslint-disable-next-line no-unused-vars
export async function linkController (req, res, next) {
    try {
        const validated = linkSchema.parse(req.body)

        const link = await createLink(
            validated.target_url,
            validated.code,
            validated.expires_at
        )

        res.status(201).json(link)
    } catch (error) {
        if (error.name === "ConflictError" || error.message.includes('already exist')){
            return res.status(409).json({ error: error.message })
        }
        
        throw new ValidationError(error)
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
            throw new NotFoundError (
                "link not found",
            )
        }

        return res.redirect(link.target_url)

    } catch (error) {
        if (error.name === "GoneError" || error.message.includes("link has expired")){
            return res.status(410).json({ error: error.message })
        }

        next(error)
    }
}

export async function getLinkController (req, res, next) {
    try {
        const { code } = req.params

        const link = await getLinkByCode(code)

        if (!link) {
            throw new NotFoundError(
                "link not found"
            )
        }

        return res.json(link)

    } catch (error) {
        next(error)
    }
}

export async function getClicksController (req, res, next) {
    try {
        const { code } = req.params

        // const page = Number(req.query.page ) || 1
        // const limit = Number(req.query.limit ) || 10
        const {after, limit} = paginationSchema.parse(req.query)

        const clicks = await getClicksByCode(code, after, limit)

        if (!clicks) {
            throw new NotFoundError (
                "click not found"
            )
        }

        return res.json(clicks)

    } catch (error) {
        next(error)
    }
}

export async function deleteLinkController (req, res, next) {
    try {
        const { code } = req.params

        const deleted = await deleteLink(code)

        if (!deleted) {
            throw new NotFoundError(
                "link not found"
            )
        }

        return res.status(204).send()
    } catch (error) {
        next(error)
    }
}

export async function exportClicksController (req, res, next) {
    try{
        const { code } = req.params
        const clicks = await getClicksForExport (code)

        res.setHeader("Content-Type", "text/csv")
        res.setHeader("Content-Disposition", `attachment: filename="${code}-clicks.csv"` )

        res.write("id,referrer,user_agent,clicked_at\n",)

        for (const click of clicks) {
            res.write(
                `${click.id}, "${click.referrer ?? ""}", "${click.user_agent ?? ""}", 
                ${click.clicked_at.toISOString()}\n
                `
            )
        }

        res.end()
    } catch (error) {
        next(error)
    }
}