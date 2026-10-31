import { query } from "../db/query.js";
import { generateCode } from "../utils/generator.js";
import { transaction } from "../db/transaction.js";

export async function createLink (targetUrl, customCode) {
    const code = customCode ?? generateCode()

    const result = await query(
        `
        INSERT INTO links (code, target_url)
        VALUES ($1, $2) RETURNING *
        `,
        [code, targetUrl]
    )

    return result.rows[0]
}

export async function redirectToLink (
    code,
    referrer,
    userAgent
) {
    return transaction (async (client) => {
        const linkResult = await client.query(
            `SELECT * FROM links WHERE code = $1`, [code]
        );

        const link = await linkResult.rows[0]

        if (!link) {
            return null
        }

        await client.query(
            `INSERT INTO clicks (link_id,referrer,user_agent)
            VALUES ($1, $2, $3)
            `,
            [link.id, referrer, userAgent]
        );

        await client.query(
            `UPDATE links SET click_count = click_count + 1
            WHERE id = $1
            `,
            [link.id]
        );

        return link
    })
}

export async function getLinkByCode (code) {
    const result = await query(
        `SELECT * FROM links WHERE code = $1`,[code]
    );

    return result.rows[0] || null
}

export async function getClicksByCode (code, page = 1, limit = 10) {
    const offset = (page - 1) * limit

    const countResult = await query(
        `SELECT COUNT(*) AS total
         FROM clicks c
         JOIN links l
         ON c.link_id = l.id
         WHERE l.code = $1
        `,
        [code]
    );

    const clicksResult = await query(
        `
        SELECT
        c.id,
        c.referrer,
        c.user_agent,
        c.clicked_at
        FROM clicks c
        JOIN links l
        ON c.link_id = l.id
        WHERE l.code = $1
        ORDER BY c.clicked_at DESC
        LIMIT $2
        OFFSET $3
        `,
        [code, limit, offset]
    );

    return {
        total: Number(
            countResult.rows[0].total
        ),
        page,
        limit,
        data: clicksResult.rows
    }
}

export async function deleteLink (code) {
    const result = await query(
        `
        DELETE FROM links
        WHERE code = $1
        RETURNING id
        `,
        [code]
    );

    return result.rowCount > 0
}