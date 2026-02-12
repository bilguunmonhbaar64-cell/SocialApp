const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const { env } = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const healthRoutes = require("./routes/healthRoutes");
const postRoutes = require("./routes/postRoutes");
const storyRoutes = require("./routes/storyRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { errorHandler, notFound } = require("./middlewares/errorHandler");

const app = express();

const buildCorsOptions = (allowedOrigins) => {
  if (!allowedOrigins || allowedOrigins === "*") {
    return { origin: true };
  }

  const whitelist = allowedOrigins.split(",").map((origin) => origin.trim());
  return {
    origin: (origin, callback) => {
      if (!origin || whitelist.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS blocked for this origin"));
    },
  };
};

app.use(helmet());
app.use(cors(buildCorsOptions(env.CLIENT_ORIGIN)));
app.use(express.json({ limit: "10mb" }));

if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.get("/", (_req, res) => {
  res.json({ message: "API is running" });
});

app.use("/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/messages", messageRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
