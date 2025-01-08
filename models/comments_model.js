const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const commentsSchema = new Schema({
  content: {
    type: String,
    required: true,
  },

  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Posts",
    required: true,
  },

  sender: {
    type: String,
    required: true,
  },

  writedAt: {
    type: Date,
    default: Date.now,
  },
});

const Comments = mongoose.model("Comments", commentsSchema);
module.exports = Comments;
