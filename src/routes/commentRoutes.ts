import express from "express";
import {
  addComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/commentController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, addComment);
router.get("/:postId", protect, getComments);
router.put("/:commentId", protect, updateComment);
router.delete("/:commentId", protect, deleteComment);

export default router;
