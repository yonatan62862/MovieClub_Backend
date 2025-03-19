import { Request, Response, NextFunction } from "express";
import { Like } from "../models/likes_model";
import mongoose from "mongoose";
import postModel from "../models/posts_model";

export const toggleLike = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { targetType, targetId, userId } = req.params;

    if (!["Post", "Comment"].includes(targetType)) {
      console.log("Invalid target type");
      res.status(400).json({ error: "Invalid target type" });
      return;
    }

    if (targetType === "Post") {
      const existingLike = await Like.findOne({ targetType, targetId, userId });

      if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);

        const updatedPost = await postModel.findByIdAndUpdate(
          targetId,
          { $pull: { likes: new mongoose.Types.ObjectId(userId) } },
          { new: true }
        );

        if (!updatedPost) {
          res.status(404).json({ error: "Post not found" });
        }

        res.status(200).json({ message: "Like removed successfully." });
      } else {
        const newLike = new Like({
          targetType,
          targetId: new mongoose.Types.ObjectId(targetId),
          userId: new mongoose.Types.ObjectId(userId),
        });

        await newLike.save();

        const updatedPost = await postModel.findByIdAndUpdate(
          targetId,
          { $push: { likes: new mongoose.Types.ObjectId(userId) } },
          { new: true }
        );

        if (!updatedPost) {
          res.status(404).json({ error: "Post not found" });
        }

        res.status(201).json({ message: "Like added successfully" });
      }
    }
  } catch (err) {
    console.error("Error:", err);
    next(err);
  }
};
