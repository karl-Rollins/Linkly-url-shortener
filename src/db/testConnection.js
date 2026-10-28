import { query } from "./query.js";

try {
    const result = await query("SELECT NOW()")

    console.log(result.rows[0])

    process.exit(0)
} catch (error) {
    console.error(error)

    process.exit(1)
}