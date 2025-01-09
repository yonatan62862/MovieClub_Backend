import commentModel from "../models/comments_model";
import { Request, Response } from "express";

const createComment = async(req: Request, res: Response) => {
    console.log(req.body);
    try {
      const comment = await commentModel.create(req.body);
      res.status(201).send(comment);
    } catch (error) {
      res.status(400).send(error);
    }
}

const getAllComments = async (req: Request, res: Response) => {
    try {
      const comments = await commentModel.find();
      res.status(200).json(comments);
    } catch (error) {
      res.status(400).json({ error });
    }
  };

  const getCommentsByPost = async (req: Request, res: Response) => {
    const { postId } = req.params; 
    try {
      const comments = await commentModel.find({ postId });
      res.status(200).json(comments);
    } catch (error) {
      res.status(400).json({ error });
    }
  };

  const updateComment = async (req: Request, res: Response) => {
    const { id } = req.params; 
    const updatedData = req.body;
    try {
      const updatedComment = await commentModel.findByIdAndUpdate(id, updatedData, {
        new: true,
        runValidators: true, 
       });
       if(!updatedComment) {
        return res.status(404).json({ message: "Comment not found" });
       }
      res.status(200).json({ message: "Comment updated successfully" });
    } catch (error) {
      res.status(400).json({ error });
    }
  };

  const deleteComment = async (req: Request, res: Response) => {
    const { id } = req.params; 
    try {
      const deletedComment = await commentModel.findByIdAndDelete(id); 
       if(!deletedComment) {
        return res.status(404).json({ message: "Comment not found" });
       }
      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
      res.status(400).json({ error });
    }
  };
  

export default { createComment, getAllComments, getCommentsByPost, updateComment, deleteComment };