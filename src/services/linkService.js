import { query } from "../db/query.js";
import { generateCode } from "../utils/generator.js";

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