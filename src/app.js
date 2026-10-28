import express from "express";
import router from "./routes/linkRoutes.js";

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

app.use((err, req, res, next) => {
    console.error(err)

    res.status(400).json({
        error: err.message,
    })
})
export default app;