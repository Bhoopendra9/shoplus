import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";

// Create new order
export const createOrder = asyncHandler(async (req, res) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    logger.error("Order creation failed: orderItems missing");
    throw new ApiError(400, "orderItems is required and should be a non-empty array");
  }

  const newOrder = await Order.create({
    shippingInfo,
    orderItems,
    user: req.user._id,
    paymentInfo,
    paidAt: paymentInfo ? Date.now() : undefined,
    itemsPrice: itemsPrice || 0,
    taxPrice: taxPrice || 0,
    shippingPrice: shippingPrice || 0,
    totalPrice: totalPrice || 0,
  });

  if (!newOrder) {
    logger.error("Failed to create order");
    throw new ApiError(500, "Failed to create order");
  }

  return res.status(201).json(
    ApiResponse.success(201, "Order created successfully", newOrder),
  );
});

// Get single order by id
export const getOrderById = asyncHandler(async (req, res) => {
  const orderId = req.params.orderid;
  if (!orderId) {
    logger.error("Order ID is required");
    throw new ApiError(400, "Order ID is required");
  }

  const order = await Order.findById(orderId)
    .populate("user", "firstName lastName email mobile")
    .populate("orderItems.product", "name price imageUrl");

  if (!order) {
    logger.error("Order not found: ", orderId);
    throw new ApiError(404, "Order not found");
  }

  return res
    .status(200)
    .json(ApiResponse.success(200, "Order fetched successfully", order));
});

// Get logged in user's orders
export const getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
  return res
    .status(200)
    .json(ApiResponse.success(200, "User orders fetched successfully", orders));
});

// Admin: Get all orders with pagination
export const getAllOrders = asyncHandler(async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 20;
  page = page < 1 ? 1 : page;
  limit = limit > 200 ? 200 : limit;
  const skip = (page - 1) * limit;

  const totalOrders = await Order.countDocuments();
  const orders = await Order.find({})
    .populate("user", "firstName lastName email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalOrders / limit);

  return res.status(200).json(
    ApiResponse.success(200, "Orders fetched successfully", orders, {
      totalOrders,
      totalPages,
      currentPage: page,
      pageSize: limit,
    }),
  );
});

// Admin: Update order status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const orderId = req.params.orderid;
  const { status } = req.body;

  if (!orderId) {
    logger.error("Order ID is required for update");
    throw new ApiError(400, "Order ID is required");
  }

  if (!status) {
    logger.error("Status is required to update order");
    throw new ApiError(400, "Status is required");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    logger.error("Order not found for update: ", orderId);
    throw new ApiError(404, "Order not found");
  }

  if (order.orderStatus === "Delivered") {
    logger.error("Order already delivered: ", orderId);
    throw new ApiError(400, "Order already delivered");
  }

  // If moving to Shipped, decrement product stock
  if (status === "Shipped") {
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
      }
    }
  }

  order.orderStatus = status;
  if (status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save();

  return res
    .status(200)
    .json(ApiResponse.success(200, "Order status updated successfully", order));
});

// Admin: Delete order
export const deleteOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.orderid;
  if (!orderId) {
    logger.error("Order ID is required for deletion");
    throw new ApiError(400, "Order ID is required");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    logger.error("Order not found for deletion: ", orderId);
    throw new ApiError(404, "Order not found");
  }

  await Order.findByIdAndDelete(orderId);

  return res
    .status(200)
    .json(ApiResponse.success(200, "Order deleted successfully"));
});

export default {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
};
