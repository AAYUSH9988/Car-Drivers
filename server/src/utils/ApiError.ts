export class ApiError extends Error {
  readonly statusCode: number;
  readonly isOperational: boolean;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string)  { return new ApiError(400, message); }
  static unauthorized(message = 'Unauthorized') { return new ApiError(401, message); }
  static forbidden(message = 'Forbidden')       { return new ApiError(403, message); }
  static notFound(resource = 'Resource')        { return new ApiError(404, `${resource} not found`); }
  static conflict(message: string)              { return new ApiError(409, message); }
  static internal(message = 'Internal server error') { return new ApiError(500, message); }
}
