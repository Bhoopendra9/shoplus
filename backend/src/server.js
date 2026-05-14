import "./env.js";
import app from "./app.js";
import logger from "./utils/logger.js"
import dbconnection from "./db/dbconnection.js"

const PORT = Number(process.env.PORT)


app.listen(PORT, ()=>{
    dbconnection();
    logger.info(`Server started at ${PORT}`)
})

