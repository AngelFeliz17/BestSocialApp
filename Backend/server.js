import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/userRoutes.js"
import postRoutes from "./routes/postRoutes.js"
import followRoutes from "./routes/followRoutes.js"

dotenv.config();

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
];

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Middleware
app.use(express.json());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Routes
app.use("/api/users", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/follows", followRoutes)
app.get("/", (req, res) => {
  res.json({ msg: "API working" });
});

// MongoDB conection
const PORT = process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Sever on port ${PORT}`));
  })
  .catch((err) => console.error("Error conecting to MongoDB:", err));