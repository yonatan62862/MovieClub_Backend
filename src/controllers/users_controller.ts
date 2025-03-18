import { Request, Response, NextFunction } from "express";
import userModel from "../models/users_model";

class UsersController {
  public async getUserDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.params.userId;
      const user = await userModel.findOne({ _id: userId });
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
}

export const usersController = new UsersController();
