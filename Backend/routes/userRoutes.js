import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/users.js";
import middleware from "../middlewares/token.js";
import upload from "../middlewares/cloudinary.js";
import { deleteImage } from "../middlewares/cloudinary.js";
import Comment from "../models/post/comments.js";
import Post from "../models/post/posts.js";
import Like from "../models/post/likes.js";
import Follow from "../models/follows.js";
import { sendEmail } from "../config/email.js";

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const {username, email, password} = req.body;

        const existingUser = await User.findOne({ email });
        if( existingUser ) return res.status(400).json({ msg: "Existing user" });

        const hashedPass = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPass });
        await newUser.save();
        await sendEmail(email, "Welcome to the family!", `<h1>Hello ${username}, welcome to the app where you'll find anything you need. </h1>`);
        res.status(200).json({ msg: "User created successfully!" });
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: "Error creating user", error });
    }
})

router.post('/login', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const user = await User.findOne({ $or: [{ email: email }, { username: username }] });
        if(!user) return res.status(404).json({ msg: "User not found" });

        if(!(await bcrypt.compare(password, user.password))) return res.status(400).json({ msg: "Incorrect password" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
        
        res.status(200).json({ token, user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar, bio: user.bio } })
    } catch (error) {
        res.status(500).json({ msg: "Error loging in", error });
    }
})

router.get("/search", async (req, res) => {
    const { q } = req.query;
  
    const users = await User.find({
      username: { $regex: q, $options: "i" } // búsqueda parcial, case insensitive
    }).select("_id username email avatar_url");
  
    res.json({ users });
  });
  

router.get('/get-my-user', middleware, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.userId }).select("-password");
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ msg: "Error getting user", error });
    }
})

router.get('/get-user-profile/:id', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.id }).select("-password");
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ msg: "Error getting user", error });
    }
})

router.put('/update-profile', middleware, upload.single("avatar"), async (req, res) => {
    try {
        const { username, email, password, bio } = req.body;
        const user = await User.findOne({ _id: req.userId });
        if(!user) return res.status(404).json({ msg: "User not found" });

        const newUserInfo = {
            username,
            email,
            bio,
        };

        if(req.file.path) newUserInfo.avatar_url = req.file.path;
        if(password && !(await bcrypt.compare(password, user.password))) newUserInfo.password = await bcrypt.hash(password, 10);
        const updatedUser = await User.findByIdAndUpdate( req.userId, newUserInfo, { new: true }).select("-password");

        res.status(200).json({ msg: "Profile updated successfully!", user: updatedUser });
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: "Error updating profile", error });
    }
});

router.put('/update-avatar', middleware, upload.single("avatar"), async (req, res) => {
    try {
        const avatar = req.file.path;
        if(!avatar) return res.status(400).json({ msg: "Avatar not found" });
        await User.findByIdAndUpdate(req.userId, { avatar });
        const user = await User.findOne({ _id: req.userId }).select("-password");
        res.status(200).json({ msg: "Avatar updated successfully!", user: user });
    } catch (error) {
        res.status(500).json({ msg: "Error updating avatar", error });
    }
});

router.delete('/delete-account', middleware, async (req, res) => {
    try {
      const posts = await Post.find({ user_id: req.userId });
      await Comment.deleteMany({ user_id: req.userId });
      await Like.deleteMany({ user_id: req.userId });

      // Delete every follow or any follower that the use has
      await Follow.deleteMany({
        $or: [ { follower_user_id: req.userId },
             { following_user_id: req.userId }
            ]});
        // Delete images associated to each posts
      for(const post of posts) {
        await deleteImage(post.file_url);
       }

      await Post.deleteMany({ user_id: req.userId });
      await User.findByIdAndDelete(req.userId);

      res.status(200).json({ msg: "User deleted successfully!" });
    } catch (error) {
      res.status(500).json({ msg: "Error deleting user", error });
    }
});

router.delete('/delete-avatar', middleware, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.userId });
        if(!user) return res.status(404).json({ msg: "User not found" });
        await deleteImage(user.avatar_url);
        await User.findByIdAndUpdate(req.userId, { avatar_url: "" });
        res.status(200).json({ msg: "Avatar deleted successfully!" });
    } catch (error) {
        res.status(500).json({ msg: "Error deleting avatar", error });
    }
})
export default router;
