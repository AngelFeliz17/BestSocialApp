import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const deleteImage = async (public_id) => {
  try {
    if(!public_id) return;
    const publicId = public_id.split("/upload/")[1].split("/").slice(1).join("/").split(".")[0];
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "auto",
    });
    return result;
  } catch (error) {
    return error;
  }
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "social_media_uploads",
    resource_type: "auto",
    allowed_formats: ["jpg", "png", "mp4", "mov", "jpeg"],
    audio_codec: "aac",
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 60 * 1024 * 1024 }
 });

export default upload;
export { deleteImage };