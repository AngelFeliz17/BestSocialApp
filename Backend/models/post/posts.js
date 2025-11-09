import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  file_url: { type: String, required: true },
  description: { type: String },
}, { timestamps: true });

export default mongoose.model("Post", postSchema);