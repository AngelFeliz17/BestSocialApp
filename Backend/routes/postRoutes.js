import express from "express";
import Post from "../models/post/posts.js";
import middleware from "../middlewares/token.js";
import upload, { deleteImage } from "../middlewares/cloudinary.js";
import Like from "../models/post/likes.js";
import Comment from "../models/post/comments.js";
import User from "../models/users.js";
import Follow from "../models/follows.js";

import { client } from "../config/openai.js";

const router = express.Router();

router.post("/analyze-image", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) return res.status(400).json({ error: "No image provided" });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Generate a caption of this image, it can even be who this is or just what you see but not long sentences." },
            { type: "image_url", image_url: { url: image }, },
          ],
        },
      ],
    });

    const caption = response.choices[0].message.content;
    res.json({ description: caption });
  } catch (error) {
    console.error("Error analyzing image:", error);
    res.status(500).json({ error: "OpenAI failed analyzing image" });
  }
});

router.post('/create-post', middleware, upload.single('file'), async (req, res) => {
    try {
        const file_url = req.file.path;
        if(!file_url) return res.status(400).json({ msg: "File not found" });
        await Post.create({ user_id: req.userId, file_url, description: req.body.description });

        res.status(200).json({ msg: "Post created" });
    } catch (error) {
        res.status(500).json({ msg: "Error creating post", error });
    }
})

router.get('/get-posts', async (req, res) => {
    try {
        const posts = await Post.find().populate("user_id", "-password").sort({ createdAt: -1 }).limit(100);
        res.status(200).json({ posts });
    } catch (error) {
        res.status(500).json({ msg: "Error getting post", error });
    }
})

router.get('/get-my-posts', middleware, async (req, res) => {
    try {
        const posts = await Post.find({ user_id: req.userId }).populate("user_id", "-password");
        if(!posts) return res.status(404).json({ msg: "Posts not found" });
        res.status(200).json({ posts });
    } catch (error) {
        res.status(500).json({ msg: "Error getting posts", error });
    }
})

router.get('/get-posts-by-user/:id', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.id });
        const posts = await Post.find({ user_id: user._id }).populate("user_id", "-password");
        if(!posts) return res.status(404).json({ msg: "Posts not found" });

        res.status(200).json({ posts });
    } catch (error) {
        res.status(500).json({ msg: "Error getting posts", error });
    }
})

router.get('/get-following-users-posts', middleware, async (req, res) => {
    try {
      const followingDocs = await Follow.find({ follower_user_id: req.userId });
  
      const Ids = followingDocs.map(f => f.following_user_id);
  
      const posts = await Post.find({ user_id: { $in: Ids } })
        .populate("user_id", "-password")
        .sort({ createdAt: -1 });
      return res.status(200).json({ posts });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Error getting following posts", error });
    }
  });
  

router.delete('/delete-post/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        await Post.findOneAndDelete({_id: req.params.id});
        
        // Delete content associated
        deleteImage(post.file_url);
        await Comment.deleteMany({ post_id: post._id });
        await Like.deleteMany({ post_id: post._id });

        res.status(200).json({ msg: "Post deleted successfully!" });
    } catch (error) {
        res.status(500).json({ msg: "Error deleting post", error });
    }
})

router.put('/update-post/:id', middleware, async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, { description: req.body.description });
        res.status(200).json({ msg: "Post updated" });
    } catch (error) {
        res.status(500).json({ msg: "Error updating post", error });
    }
})

router.get('/get-likes-by-post/:id', middleware, async (req, res) => {
    try {
        const likes = await Like.find({ post_id: req.params.id });
        res.status(200).json({ likesLength: likes.length });
    } catch (error) {
        res.status(500).json({ msg: "Error getting likes", error });
    }
})

router.get('/get-likes-by-user/', middleware, async (req, res) => {
    try {
        const likes = await Like.find({ user_id: req.userId });
        res.status(200).json({ likes: likes });
    } catch (error) {
        res.status(500).json({ msg: "Error getting likes", error });
    }
})

router.post('/like-post/:id', middleware, async (req, res) => {
    try {
        // Get the number of likes for the post
        const likes = await Like.find({ post_id: req.params.id });

        // Check if the user has already liked the post
        const liked = await Like.findOne({ user_id: req.userId, post_id: req.params.id });

        // If the user has already liked the post, delete the like
        if(liked) {
            const deletedLike = await Like.findOneAndDelete(liked._id);
            return res.status(200).json({ like: false, likesCount: likes.length - 1  });
        }

        // If the user has not liked the post, create a new like
        await Like.create({ user_id: req.userId, post_id: req.params.id });
        return res.status(200).json({ like: true, likesCount: likes.length + 1 });
    } catch (error) {
        return res.status(500).json({ msg: "Error liking post", error });
    }
})

router.get('/get-comments/:id', async (req, res) => {
    try {
        const comments = await Comment.find({ post_id: req.params.id }).populate("user_id", "-password");
        res.status(200).json({ comments });
    } catch (error) {
        res.status(500).json({ msg: "Error getting comments", error });
    }
})

router.post('/add-comment/:id', middleware, async (req, res) => {
    try {
        const comment = await Comment.create({ user_id: req.userId, post_id: req.params.id, text: req.body.text });
        const getComment = await Comment.find(comment._id).populate("user_id", "-password -email -bio -createdAt -updatedAt");
        res.status(200).json({ msg: "Comment added successfully!", comment: getComment });
    } catch (error) {
        res.status(500).json({ msg: "Error adding comment", error });
    }
})

router.delete('/delete-comment/:id', async (req, res) => {
    try {
        await Comment.deleteOne({ _id: req.params.id });
        res.status(200).json({ msg: "Comment deleted successfully!" });
    } catch (error) {
        res.status(500).json({ msg: "Error removing comment", error });
    }
})

export default router;
