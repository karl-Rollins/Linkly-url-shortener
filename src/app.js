import express from "express";
import router from "./routes/linkRoutes.js";
import errorHandler from "./middleware/errorHandle.js";
import notfound from "./middleware/notfound.js";

const app = express()

app.use(express.json()) // req.body is undefined without this.


app.get("/health", (req,res) => {
    res.status(200).json({
        status: "ok",
    })
})

app.use(router)

app.use(notfound)

app.use(errorHandler)
export default app;