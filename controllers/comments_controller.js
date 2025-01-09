const Comments = require("../models/comments_model");

const createComment = async(req,res) => {
    console.log(req.body);
    try {
      const comment = await Comments.create(req.body);
      res.status(201).send(comment);
    } catch (err) {
      res.status(400).send(err.message);
    }
}

const getAllComments = async (req, res) => {
    try {
      const comments = await Comments.find();
      res.status(200).json(comments);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  const getCommentsByPost = async (req, res) => {
    const { postId } = req.params; 
    try {
      const comments = await Comments.find({ postId });
      res.status(200).json(comments);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  const updateComment = async (req, res) => {
    const { id } = req.params; 
    const updatedData = req.body;
    try {
      const updatedComment = await Comments.findByIdAndUpdate(id, updatedData, {
        new: true,
        runValidators: true, 
       });
       if(!updatedComment) {
        return res.status(404).json({ message: "Comment not found" });
       }
      res.status(200).json({ message: "Comment updated successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  const deleteComment = async (req, res) => {
    const { id } = req.params; 
    try {
      const deletedComment = await Comments.findByIdAndDelete(id); 
       if(!deletedComment) {
        return res.status(404).json({ message: "Comment not found" });
       }
      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };
  

module.exports = { createComment, getAllComments, getCommentsByPost, updateComment, deleteComment };