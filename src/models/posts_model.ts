import mongoose, { Types } from "mongoose";
import { appConfig } from "../utils/appConfig";
const Schema = mongoose.Schema;

export type MediaItem = {
  url: string;
  type: "image" | "video";
};

export interface IPost {
  title: string;
  content: string;
  owner: mongoose.Types.ObjectId;
  likes: Types.ObjectId[];
  imageNames: MediaItem[];
  comments: mongoose.Types.ObjectId[];
}
const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
      content: String,
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is missing."],
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "commentModel" }],
    imageNames: [{ url: { type: String }, type: { type: String } }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.methods.isLikedByUser = function (
  this: IPost,
  userId: mongoose.Types.ObjectId
): boolean {
  return this.likes.some((like) => like.equals(userId));
};

postSchema.virtual("photos").get(function (this: IPost) {
  return this.imageNames.map((imageName) => {
    return {
      imageUrl: appConfig.basePostsImageUrl + imageName.url,
      type: imageName.type,
    };
  });
});

postSchema.virtual("likesCount").get(function (this: IPost) {
  return this.likes.length;
});

postSchema.virtual("commentsCount").get(function (this: IPost) {
  return this.comments.length;
});

const postModel = mongoose.model<IPost>("Posts", postSchema);
export default postModel;
