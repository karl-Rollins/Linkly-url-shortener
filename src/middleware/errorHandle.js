import { ZodError } from "zod";
import { logger } from "../utils/logger.js";
import { ValidationError } from "../errors/ValidationError.js";

//eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
    logger.error(err)

    if (err instanceof ZodError) {
        return res.status(400).json({
            error: "Validation failed",
            issues: err.issues
        })
    }

    if (err instanceof ValidationError) {
        return res.status(400).json({
            error: err.message,
            issues: err.issues,
        });
    }

    if (err.code === "23505") {
        return res.status(409).json({
            error: "code already exists",
        })
    }

    if (err.statusCode) {
        return res.status(err.statusCode).json({
            error: err.message,
        })
    }

    return res.status(500).json({
        error: "Internal server error",
    })
}

export default errorHandler