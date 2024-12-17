const Posts = require("../models/posts_model");

const getAllPosts = async (req, res) => {
  try {
      const posts = await Posts.find();
    return res.send(posts);
    } catch (err) {
    res.status(400).send(err.message);
  }
};

const getPostsBySender = async (req, res) => {
  try {
    const sender = req.query.sender; 
    if (!sender) {
      return res.status(400).json({ error: "Missing sender parameter" });
    }

    const posts = await Posts.find({ sender: sender });
    if (posts.length === 0) {
      return res.status(404).json({ message: "No posts found for this sender" });
    }

    return res.status(200).json(posts); 
  } catch (err) {
    res.status(500).json({ error: err.message }); 
  }
};


const getPostById = async (req,res) => {
  const id = req.params.id;
  if(id) {
    try {
      const post = await Posts.findById(id);
      if (post) {
        return res.send(post);
      } else {
        return res.status(404).send("Post not found");
      }
    } catch (err) {
      return res.status(400).send(err.message);
    }
  }
  return res.status(400).send(err.message);
};

const createPost = async (req, res) => {
  console.log(req.body);
  try {
    const post = await Posts.create(req.body);
    res.status(201).send(post);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

//

const updatePost = async (req,res) => {
  const id = req.params.id;
  const updatedData = req.body;
    try {
      const updatedPost = await Posts.findByIdAndUpdate(id, updatedData, {
        new: true,
        runValidators: true,
      });

      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      } else {
         return res.status(200).json(updatedPost);
      }
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  };

module.exports = { getAllPosts, createPost, getPostById, getPostsBySender, updatePost };