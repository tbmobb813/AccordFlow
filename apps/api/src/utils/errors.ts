export class AppError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}
