import Product from "../models/product.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinary.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../utils/validation.product.js";

//get all products list
export const getAllProducts = asyncHandler(async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;

  // Safety limits
  page = page < 1 ? 1 : page;
  limit = limit > 100 ? 100 : limit;

  const skip = (page - 1) * limit;

  // Total documents count
  const totalProducts = await Product.countDocuments();

  const productsList = await Product.find({})
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  if (!productsList) {
    logger.error("Products not found");
    throw new ApiError(400, "Products not found");
  }

  // Pagination metadata
  const totalPages = Math.ceil(totalProducts / limit);

  return res.status(200).json(
    ApiResponse.success(200, "Products fetch successfully", productsList, {
      totalProducts,
      totalPages,
      currentPage: page,
      pageSize: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    }),
  );
});

//Create a new product
export const createProduct = asyncHandler(async (req, res) => {
  const result = createProductSchema.safeParse(req.body);
  if (!result.success) {
    const formattedErrors = result.error.flatten().fieldErrors;
    logger.error("Validation error: ", formattedErrors);
    throw new ApiError(400, "Validation error: ", formattedErrors);
  }
  const { name, description, price, category, stock } = result.data;

  //upload images to cloudinary
  const productImages = await uploadToCloudinary(req.file?.path);
  if (!productImages) {
    logger.error("Image upload failed");
    throw new ApiError(500, "Image upload failed");
  }

  const newProduct = await Product.create({
    name,
    description,
    price,
    category,
    stock,
    imageUrl: productImages.secure_url,
    publicId: productImages.public_id,
    uploadedBy: req.user._id,
  });
  if (!newProduct) {
    logger.error("Product creation failed");
    throw new ApiError(500, "Product creation failed");
  }
  return res
    .status(201)
    .json(ApiResponse.success(201, "Product created successfully", newProduct));
});

//get product by id
export const productDetail = asyncHandler(async (req, res) => {
  const productId = req.params.productid;
  if (!productId) {
    logger.error("Product ID is required");
    throw new ApiError(400, "Product ID is required");
  }

  const product = await Product.findById(productId);
  if (!product) {
    logger.error("Product not found");
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(
      ApiResponse.success(200, "Product details fetched successfully", product),
    );
});

//update product by id
export const updateProduct = asyncHandler(async (req, res) => {
  const productId = req.params.productid;
  if (!productId) {
    logger.error("Product ID is required");
    throw new ApiError(400, "Product ID is required");
  }

  const result = updateProductSchema.safeParse(req.body);
  if (!result.success) {
    const formattedErrors = result.error.flatten().fieldErrors;
    logger.error("Validation error: ", formattedErrors);
    throw new ApiError(400, "Validation error: ", formattedErrors);
  }

  const updatedData = result.data;

  // If a new image is uploaded, handle the upload and update the image fields
  if (req.file) {
    const productImages = await uploadToCloudinary(req.file.path);
    if (!productImages) {
      logger.error("Image upload failed");
      throw new ApiError(500, "Image upload failed");
    }
    updatedData.imageUrl = productImages.secure_url;
    updatedData.publicId = productImages.public_id;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    { $set: updatedData },
    { new: true },
  );

  if (!updatedProduct) {
    logger.error("Product update failed");
    throw new ApiError(500, "Product update failed");
  }

  return res
    .status(200)
    .json(
      ApiResponse.success(200, "Product updated successfully", updatedProduct),
    );
});

//delete product by id
export const deleteProduct = asyncHandler(async (req, res) => {
  const productId = req.params.productid;
  if (!productId) {
    logger.error("Product ID is required");
    throw new ApiError(400, "Product ID is required");
  }

  const product = await Product.findById(productId);
  if (!product) {
    logger.error("Product not found");
    throw new ApiError(404, "Product not found");
  }

  // Delete image from Cloudinary
  if (product.publicId) {
    await deleteFromCloudinary(product.publicId);
  }

  await Product.findByIdAndDelete(productId);

  return res
    .status(200)
    .json(ApiResponse.success(200, "Product deleted successfully"));
});
