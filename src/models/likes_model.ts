import mongoose, { Document, Schema, model } from "mongoose";

export interface ILike extends Document {
  targetType: "Post" | "Comment";
  targetId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
}

const LikeSchema = new Schema<ILike>(
  {
    targetType: {
      type: String,
      enum: ["Post", "Comment"],
      required: [true, "Entity type is missing."],
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: [true, "Target ID is missing."],
      refPath: "targetType",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is missing."],
    },
  },
  {
    versionKey: false,
    timestamps: true, 
  }
);

LikeSchema.index({ targetType: 1, targetId: 1, userId: 1 }, { unique: true });

export const Like = model<ILike>("Like", LikeSchema, "likes");
