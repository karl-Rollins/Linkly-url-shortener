import express from "express";

const app = express()

app.use(express.json()) // req.body is undefined without this.

app.use((req, res) => {
    res.status(404).json({
        error: "Route not found",
    })
})

app.get("/health", (req,res) => {
    res.status(200).json({
        status: "ok",
    })
})

export default app;