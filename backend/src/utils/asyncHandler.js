import ApiError from "./ApiError.js";

// const asyncHandler = (fn) => (req, res, next) => {
//   Promise.resolve(fn(req, res, next)).catch((err) => {
//     if (typeof next === "function") {
//       next(err.statusCode ? err : new ApiError(500, err.message));
//     } else {
//       console.error("next is not a function:", err);
//     }
//   });
// };

// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (err) {
//     // convert unknown errors into ApiError
//     next(err.statusCode ? err : new ApiError(500, err.message));
//   }
// };

// second method by using promises
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
