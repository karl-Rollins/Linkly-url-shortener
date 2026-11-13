import { linkSchema } from "../schemas/linkSchema.js";
import { createLink } from "../services/linkService.js";
import { redirectToLink } from "../services/linkService.js";
import { getLinkByCode } from "../services/linkService.js";
import { getClicksByCode } from "../services/linkService.js";
import { deleteLink } from "../services/linkService.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ValidationError } from "../errors/ValidationError.js";
import { paginationSchema } from "../schemas/paginationSchema.js";
import { ZodError } from "zod";
import { clicksToCsvRow } from "../utils/csvFormatter.js";
import { query } from "../db/query.js";

export async function healthController(req,res,) {
  try {
    await query("SELECT 1");

    return res.status(200).json({
      status: "ok",
      database: "ok",
    });
  } catch  {
    return res.status(503).json({
      status: "error",
      database: "down",
    });
  }
}

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
        
        if (error instanceof ZodError) {
            return next(
                new ValidationError ("validation failed", error.issues)
            )
        }

        next (error)
    }
}

export async function redirectController (req, res, next) {
    try {
        const { code } = req.params

        const link = await redirectToLink (
            code,
            req.get("referrer") || null,
            req.get("user-agent") || null
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

        const link = await getLinkByCode (code)

        if (!link) {
            throw new NotFoundError("link not found")
        }

        const {after, limit} = paginationSchema.parse(req.query)

        const clicks = await getClicksByCode(code, after, limit)

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

export async function exportClicksController(req,res,next) {
  try {
    const { code } = req.params;

    const batchSize = 1000
    let cursor = null

    // const clicks =
    //   await getClicksForExport(code);

    // if (clicks === null) {
    //   throw new NotFoundError(
    //     "Link not found",
    //   );
    // }

    // const csv =clicksToCsv(clicks);

    res.setHeader(
      "Content-Type",
      "text/csv",
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${code}-clicks.csv"`,
    );

    res.write("id,referrer,user_agent,clicked_at\n",)

    while(true) {
        const { data, next_cursor } = await getClicksByCode(code, cursor, batchSize)
        if (data.length === 0) {
            break
        }

        for (const click of data) {
            const row  = clicksToCsvRow(click)

            if (!res.write(row)) {
                await new Promise ((resolve) => res.once("drain", resolve))
            }
        }

        if (!next_cursor) {
            break
        }

        cursor = next_cursor
    }

    res.end()
  } catch (error) {
    next(error);
  }
}