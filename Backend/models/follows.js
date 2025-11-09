import mongoose from "mongoose";

const followingSchema = new mongoose.Schema({
  follower_user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  following_user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export default mongoose.model("Following", followingSchema);