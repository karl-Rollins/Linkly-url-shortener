import { AppError } from "./appError.js";

export class ConflictError extends AppError {
    constructor (message = "conflict") {
        super(message, 409)
    }
}