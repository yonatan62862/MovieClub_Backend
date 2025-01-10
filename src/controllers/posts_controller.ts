import postModel, { IPost } from "../models/posts_model";
import { Request, Response } from "express";
import BaseController from "./base_controller";

const baseController = new BaseController<IPost>(postModel);



export default baseController;

