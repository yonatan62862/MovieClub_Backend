import commentModel from "../models/comments_model";
import BaseController from "./base_controller";

const commentsController = new BaseController(commentModel);

export default commentsController;