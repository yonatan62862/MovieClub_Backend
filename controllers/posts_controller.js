const postModel = require("../models/posts_model");

const getAllPosts = async (req, res) => {
  const ownerFilter = req.query.owner;
  try {
    if (ownerFilter) {
      const posts = await postModel.find({ owner: ownerFilter });
      res.status(200).send(posts);
    } else {
      const posts = await postModel.find();
      res.status(200).send(posts);
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};



const getPostById = async (req, res) => {
  const postId = req.params.id;
  try {
    const post = await postModel.findById(postId);
    if (post === null) {
      return res.status(404).send("Post not found");
    } else {
      return res.status(200).send(post);
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const createPost = async (req, res) => {
  const post = req.body;
  try {
    const newPost = await postModel.create(post);
    res.status(201).send(newPost);
  } catch (error) {
    res.status(400).send(error);
  }
};

const deletePost = async (req, res) => {
  const postId = req.params.id;
  try {
    await postModel.findByIdAndDelete(postId);
    res.status(200).send();
  } catch (error) {
    res.status(400).send(error);
  }
};

const getPostsByOwner = async (req, res) => {
  try {
    const owner = req.query.owner;

    if (!owner) {
      return res.status(400).send({ message: "Owner query parameter is required" });
    }

    const posts = await postModel.find({ owner });
    res.status(200).send(posts);
  } catch (error) {
    console.error("Error fetching posts by owner:", error.message);
    res.status(500).send({ message: error.message });
  }
};

const updatePost = async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;
  try {
    const updatedPost = await postModel.findByIdAndUpdate(id, updatedData, {
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


module.exports = {
  getAllPosts,
  createPost,
  getPostById,
  getPostsByOwner,
  updatePost,
  deletePost,
};
