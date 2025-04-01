import mongoose from "mongoose";

interface IPost extends mongoose.Document {
  user: mongoose.Schema.Types.ObjectId;
  text: string;
  image?: string;
  likes: mongoose.Schema.Types.ObjectId[];
  createdAt: Date;
  imageUrl?: string; // optional virtual field
}

const PostSchema = new mongoose.Schema<IPost>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    image: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Virtual field for full image URL
PostSchema.virtual("imageUrl").get(function (this: IPost) {
  if (!this.image) return null;

  const baseUrl = process.env.BASE_URL || "https://node17.cs.colman.ac.il";
  const imagePath = this.image.startsWith("/uploads") ? this.image : `/uploads/${this.image}`;
  return `${baseUrl}${imagePath}`;
});

// Ensure virtuals are included in JSON output
PostSchema.set("toJSON", { virtuals: true });

const Post = mongoose.model<IPost>("Post", PostSchema);

export default Post;
