import { query } from "./query.js";
import { logger } from "../utils/logger.js";

try {
    const result = await query("SELECT NOW()")

    logger.info(result.rows[0])

    process.exit(0)
} catch (error) {
    logger.error(error)

    process.exit(1)
}