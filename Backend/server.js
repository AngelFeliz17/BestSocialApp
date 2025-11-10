import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import followRoutes from "./routes/followRoutes.js";

dotenv.config();

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("/", cors());

app.use("/api/users", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/follows", followRoutes);

app.get("/", (req, res) => {
  res.json({ msg: "API working" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));