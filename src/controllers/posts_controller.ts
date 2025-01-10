import postModel from "../models/posts_model";
import { Request, Response } from "express";


const getAllPosts = async (req: Request, res: Response) => {
  const ownerFilter = req.query.owner;
  try {
    if (ownerFilter) {
      const posts = await postModel.find({ owner: ownerFilter });
      res.status(200).send(posts);
    } else {
      const posts = await postModel.find();
      res.status(200).send(posts);
    }
  } catch (error) {
    res.status(400).send(error);
  }
};



const getPostById = async (req: Request, res: Response) => {
  const postId = req.params.id;
  try {
    const post = await postModel.findById(postId);
    if (post === null) {
      return res.status(404).send("Post not found");
    } else {
      return res.status(200).send(post);
    }
  } catch (error) {
    res.status(400).send(error);
  }
};

const createPost = async (req: Request, res: Response) => {
  const post = req.body;
  try {
    const newPost = await postModel.create(post);
    res.status(201).send(newPost);
  } catch (error) {
    res.status(400).send(error);
  }
};

const deletePost = async (req: Request, res: Response) => {
  const postId = req.params.id;
  try {
    await postModel.findByIdAndDelete(postId);
    res.status(200).send();
  } catch (error) {
    res.status(400).send(error);
  }
};

const getPostsByOwner = async (req: Request, res: Response) => {
  try {
    const owner = req.query.owner;

    if (!owner) {
      return res.status(400).send({ message: "Owner query parameter is required" });
    }

    const posts = await postModel.find({ owner });
    res.status(200).send(posts);
  } catch (error) {
    console.error("Error fetching posts by owner:", error);
    res.status(500).send( error );
  }
};

const updatePost = async (req: Request, res: Response) => {
  const id = req.params.id;
  const updatedData = req.body;
  try {
    const updatedPost = await postModel.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    } else {
      return res.status(200).json(updatedPost);
    }
  } catch (error) {
    return res.status(400).json(error);
  }
};


export default {
  getAllPosts,
  createPost,
  getPostById,
  getPostsByOwner,
  updatePost,
  deletePost,
};
