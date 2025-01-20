import postModel, { IPost } from "../models/posts_model";
import { Request, Response } from "express";
import commentModel from "../models/comments_model";
import BaseController from "./base_controller";

class PostController extends BaseController<IPost> {
    constructor() {
        super(postModel);
    }

   
async create(req: Request, res: Response) {
      const userId = req.params.userId;
      const post = {
          ...req.body,
          owner: userId
      }
      req.body = post;
      super.create(req, res);
  };

async deleteItem(req: Request, res: Response) {
    const postId = req.params.id;
    await commentModel.deleteMany({ postId });
    super.deleteItem(req, res); 
    }
}

export default new PostController();

