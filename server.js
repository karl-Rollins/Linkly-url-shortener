import app from "./src/app.js"
import { logger } from "./src/utils/logger.js";
import { env } from "./src/db/env.js";


app.listen(env.PORT, ()=> {
    logger.info(`Server is running on port ${env.PORT}`)
})