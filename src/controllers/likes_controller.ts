import { Request, Response, NextFunction } from "express";
import { Like } from "../models/likes_model";
import mongoose from "mongoose";


export const addLike = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { targetType, targetId } = req.params;
    const userId = req.user._id;

    if (!["Post", "Comment"].includes(targetType)) {
      res.status(400).json({ error: "Invalid target type" });
      return;
    }

    const existingLike = await Like.findOne({ targetType, targetId, userId });
    if (existingLike) {
      res.status(400).json({ error: "Like already exists" });
      return;
    }

    const newLike = new Like({
      targetType,
      targetId: new mongoose.Types.ObjectId(targetId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    await newLike.save();
    res.status(201).json({ message: "Like added successfully", like: newLike });
    return;
  } catch (err) {
    next(err);
  }
};


export const removeLike = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { targetType, targetId } = req.params;
    const userId = req.user._id;

    const deletedLike = await Like.findOneAndDelete({ targetType, targetId, userId });

    if (!deletedLike) {
      res.status(404).json({ error: "Like not found" });
      return;
    }

    res.status(200).json({ message: "Like removed successfully" });
    return;
  } catch (err) {
    next(err);
  }
};


export const getLikesCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { targetType, targetId } = req.params;

    if (!["Post", "Comment"].includes(targetType)) {
      res.status(400).json({ error: "Invalid target type" });
      return;
    }

    const likesCount = await Like.countDocuments({ targetType, targetId });

    res.status(200).json({ targetType, targetId, likesCount });
    return;
  } catch (err) {
    next(err);
  }
};
