import express from "express";
const router = express.Router();
import commentsController from "../controllers/comments_controller";

router.post("/", commentsController.createComment);

router.get("/", commentsController.getAllComments);

router.get("/posts/:postId", commentsController.getCommentsByPost);

router.put("/:id", (req, res)  => { commentsController.updateComment(req, res); });

router.delete("/:id", (req, res)  => { commentsController.deleteComment(req, res); });

export default router;
