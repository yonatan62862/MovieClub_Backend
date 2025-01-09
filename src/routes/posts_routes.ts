import express from "express";
const router = express.Router();
import postsController from "../controllers/posts_controller";

router.get("/by-owner",(req, res) => { postsController.getPostsByOwner(req, res); });

router.get("/", postsController.getAllPosts);

router.get("/:id", (req, res) => { postsController.getPostById(req, res); });

router.post("/",postsController.createPost);

router.put("/:id", (req, res)  => { postsController.updatePost(req, res); });

router.delete("/:id", postsController.deletePost);



export default router;
