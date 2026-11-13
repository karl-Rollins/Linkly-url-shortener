import express from "express";
import router from "./routes/linkRoutes.js";
import errorHandler from "./middleware/errorHandle.js";
import notfound from "./middleware/notfound.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./docs/swagger.js";
import cors from "cors"
import { healthController } from "./controllers/linkController.js"


const app = express()

app.use(cors())

app.use(express.json()) // req.body is undefined without this.


app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
)


app.get("/health", healthController)

app.use(router)

app.use(notfound)

app.use(errorHandler)
export default app;