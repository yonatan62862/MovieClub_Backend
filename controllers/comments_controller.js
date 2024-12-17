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

  module.exports = { createComment, getAllComments, getCommentsByPost };