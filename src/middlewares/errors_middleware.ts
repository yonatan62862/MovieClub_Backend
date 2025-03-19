import { NextFunction, Request, Response } from "express";
import { RouteNotFoundError, StatusCode } from "../models/client_errors";
import { appConfig } from "../utils/appConfig";

class ErrorsMiddleware {
  // Route not found:
  public routeNotFound(
    request: Request,
    response: Response,
    next: NextFunction
  ): void {
    // Create client error:
    const err = new RouteNotFoundError(request.originalUrl);

    // Go to catch-all:
    next(err);
  }

  // Catch all:
  public catchAll(
    err: any,
    request: Request,
    response: Response,
    next: NextFunction
  ): void {
    // Log error to console:
    console.log(err);

    // Take error status:
    const status = err.status || StatusCode.InternalServerError;

    // Take error message:
    const message =
      status === StatusCode.InternalServerError && appConfig.isProduction
        ? "Some error, please try again later."
        : err.message;

    // Response the error:
    response.status(status).send(message);
  }
}

export const errorsMiddleware = new ErrorsMiddleware();
