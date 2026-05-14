//A standard structure for API responses

class ApiResponse {
  constructor({
    statusCode = 200,
    message = "Success",
    data = null,
    pagination = null,
    errors = [],
  }) {
    this.statusCode = statusCode;
    this.success = statusCode >= 200 && statusCode < 300;
    this.message = message;
    this.data = data;
    this.pagination = pagination;
    this.errors = errors;
  }

  static success(statusCode = 200, message = "Success", data, pagination = null) {
    return new ApiResponse({
      statusCode,
      message,
      data,
      pagination,
    });
  }

  static error(statusCode = 500, message = "Error", errors = []) {
    return new ApiResponse({
      statusCode,
      message,
      errors,
    });
  }
}

export default ApiResponse;

//how to use and response
/*
res.status(200).json(
  ApiResponse.success(user, "User fetched successfully")
);
//response with pagination
res.status(200).json(
  ApiResponse.success(users, "Users list", 200, {
    total: 100,
    page: 1,
    limit: 10,
  })
);
res.status(400).json(
  ApiResponse.error("Invalid input", 400)
);
{
  "success": true,
  "message": "Users fetched",
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1
  },
  "errors": []
} */
