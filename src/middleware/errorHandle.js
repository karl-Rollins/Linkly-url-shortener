import { ZodError } from "zod";

//eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
    console.error(err)

    if (err instanceof ZodError) {
        return res.status(400).json({
            error: "Validation failed",
            // details: err.errors.map(issue => ({
            //     field: issue.path.join('.'),
            //     message: issue.message
            // }))
        })
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