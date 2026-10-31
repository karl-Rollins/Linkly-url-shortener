import express from "express";
import router from "./routes/linkRoutes.js";
import { ZodError } from "zod";

const app = express()

app.use(express.json()) // req.body is undefined without this.


app.get("/health", (req,res) => {
    res.status(200).json({
        status: "ok",
    })
})

app.use(router)

app.use((req, res) => {
    res.status(404).json({
        error: "Route not found",
    })
})

//eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
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
})
export default app;