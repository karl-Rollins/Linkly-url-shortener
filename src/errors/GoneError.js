import { AppError } from "./appError.js"

export class GoneError extends AppError {
    constructor (message = "link has expired") {
        super(message, 410)
    }
}