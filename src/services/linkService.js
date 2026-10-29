import { query } from "../db/query.js";
import { generateCode } from "../utils/generator.js";
import { transaction } from "../db/transaction.js";

export async function createLink (targetUrl) {
    const code = generateCode()

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

