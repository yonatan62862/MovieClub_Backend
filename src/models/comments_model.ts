import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  text: string;
  postId: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
}

const commentSchema = new Schema<IComment>({
  text: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  postId: { type: Schema.Types.ObjectId, ref: "Posts", required: true },
});

const commentModel = mongoose.model<IComment>("Comment", commentSchema);
export default commentModel;
