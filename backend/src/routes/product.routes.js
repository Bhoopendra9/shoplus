import express from "express";

import authUserMiddleware from "../middlewares/auth.user.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import multerMiddleware from "../middlewares/multer.middleware.js";
import { validateParams } from "../middlewares/params.schema.middleware.js";
import { productIdSchemaParams } from "../utils/validation.product.js";
import {
  getAllProducts,
  createProduct,
  productDetail,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

const router = express.Router();

// Import product controller functions
router.route("/").get(getAllProducts);
router
  .route("/create-product")
  .post(
    authUserMiddleware,
    adminMiddleware,
    multerMiddleware.single("images"),
    createProduct,
  );
router
  .route("/:productid")
  .get(productDetail)
  .patch(
    authUserMiddleware,
    adminMiddleware,
    multerMiddleware.single("images"),
    updateProduct,
  )
  .delete(authUserMiddleware, adminMiddleware, deleteProduct);

export default router;
