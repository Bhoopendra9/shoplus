import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cookieparser from "cookie-parser"

import logger from "./utils/logger.js";

const app = express();

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cookieparser())

// Morgan stream → Winston
const morganStream = {
  write: (message) => {
    logger.info(message.trim());
  },
};
// HTTP request logging
app.use(morgan("combined", { stream: morganStream }));

//route import
import userRoute from "./routes/user.routes.js"
import productRoute from "./routes/product.routes.js"

app.use("/api/v1/auth", userRoute )
app.use("/api/v1/products", productRoute )

export default app;
