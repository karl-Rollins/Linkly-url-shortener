import { AppError } from "./appError.js";

export class ValidationError extends AppError {
    constructor (
        message = "Validation failed",
        issues = []
    ) {
        super(message, 400)

        this.issues = issues
    }
}