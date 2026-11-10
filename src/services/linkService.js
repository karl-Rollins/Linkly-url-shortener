import { query } from "../db/query.js";
import { generateCode } from "../utils/generator.js";
import { transaction } from "../db/transaction.js";
import { GoneError } from "../errors/GoneError.js";
import { ConflictError } from "../errors/ConflictError.js";

export async function createLink (targetUrl, customCode, expiresAt) {
    const code = customCode ?? generateCode()
    
    if (customCode) {
        const existingLink = await query(
            'SELECT 1 FROM links WHERE code = $1',
            [customCode]
        )

        if (existingLink.rows.length > 0) {
            throw new ConflictError("custom code already exist")
        }
    }

    const result = await query(
        `
        INSERT INTO links (code, target_url, expires_at)
        VALUES ($1, $2, $3) RETURNING *
        `,
        [code, targetUrl, expiresAt ?? null]
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

        if (link.expires_at && new Date(link.expires_at) < new Date()) {
            throw new GoneError("link has expired")
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

export async function getClicksByCode (code, after, limit = 20) {
    const params = [code]

    let whereClause = ""

    if (after) {
        whereClause = "AND c.id < $2"

        params.push(after);
    }

    params.push(limit);

    const limitIndex = params.length;

    const result = await query(
        `SELECT
         c.id,
         c.referrer,
         c.user_agent,
         c.clicked_at
         FROM clicks c
         JOIN links l
            ON c.link_id = l.id
         WHERE l.code = $1
         ${whereClause}
         ORDER BY c.id DESC
         LIMIT $${limitIndex}
        `,
        params
    );

    const rows = result.rows.map(
        (row) => ({...row, id: Number(row.id)})
    )

    const hasMore = rows.length > limit;

    const data = hasMore ? rows.slice(0, limit) : rows


    return {
       data,
       next_cursor:
          hasMore ? data[ data.length - 1 ].id : null
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

export async function getClicksForExport(code,) {
  const linkResult = await query(
    `
    SELECT id
    FROM links
    WHERE code = $1
    `,
    [code],
  );

  const link = linkResult.rows[0];

  if (!link) {
    return null;
  }

  const clicksResult = await query(
    `
    SELECT
      c.id,
      c.referrer,
      c.user_agent,
      c.clicked_at
    FROM clicks c
    WHERE c.link_id = $1
    ORDER BY c.id DESC
    `,
    [link.id],
  );

  return clicksResult.rows;
}