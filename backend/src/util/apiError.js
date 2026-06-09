// Custom error class that carries an HTTP status code.
// Thrown in service/middleware layers and caught by the central errorHandler.
export class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.status = statusCode;
    }
}
