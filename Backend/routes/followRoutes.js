import express from "express";
import Follow from "../models/follows.js";
import User from "../models/users.js";
import middleware from "../middlewares/token.js";

const router = express.Router();

router.post('/follow/:id', middleware, async (req, res) => {
    try {
        const followerUser = await Follow.findOne({ follower_user_id: req.userId, following_user_id: req.params.id });
        if(followerUser) {
            await Follow.findOneAndDelete(followerUser._id);
            return res.status(200).json({ msg: "Unfollowed", following: false });
        }

        await Follow.create({ follower_user_id: req.userId, following_user_id: req.params.id });
        res.status(200).json({ msg: "Followed", following: true });
    } catch (error) {
        res.status(500).json({ msg: "Error following user", error });
    }
})

router.get('/get-followers', middleware, async (req, res) => {
    try {
        const followers = await Follow.find({ following_user_id: req.userId }).populate("follower_user_id", "-password -email -bio -avatar_url -username").populate("following_user_id", "-password -email -bio -avatar_url -username");
        const followings = await Follow.find({ follower_user_id: req.userId }).populate("following_user_id", "-password -email -bio -avatar_url -username").populate("follower_user_id", "-password -email -bio -avatar_url -username");
        res.status(200).json({ followers, followersLength: followers.length, followings, followingsLength: followings.length });
    } catch (error) {
        res.status(500).json({ msg: "Error getting followers", error });
    }
})

router.get('/get-user-followers/:id', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.id });
        if (!user) return res.status(404).json({ msg: "User not found" });

        const followers = await Follow.find({ following_user_id: user.id }).populate("follower_user_id", "-password -email -bio -avatar_url -username").populate("following_user_id", "-password -email -bio -avatar_url -username");
        const followings = await Follow.find({ follower_user_id: user.id }).populate("following_user_id", "-password -email -bio -avatar_url -username").populate("follower_user_id", "-password -email -bio -avatar_url -username");
        res.status(200).json({ followers, followersLength: followers.length, followings, followingsLength: followings.length });
    } catch (error) {
        res.status(500).json({ msg: "Error getting followers", error });
    }
})

export default router;