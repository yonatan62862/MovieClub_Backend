import mongoose from "mongoose";

declare module "express" {
  export interface Request {
    user?: {
      _id: mongoose.Types.ObjectId;
    };
  }
}
