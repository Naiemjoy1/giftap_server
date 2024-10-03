const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB } = require("./config/db");
const productRoutes = require("./routes/products");
const userRoutes = require("./routes/users");
const reviewRoutes = require("./routes/reviews");
const promoRoutes = require("./routes/promos");
const chatRoutes = require("./routes/chats");
const applyRoutes = require("./routes/applys");
const recentview = require("./routes/recentview");
const blogsRouters = require("./routes/blogs");
const http = require("http"); //will check later
const { Server } = require("socket.io");

const app = express();
const port = process.env.PORT || 3000;

// Create an HTTP server
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://giftap901.web.app"],
    credentials: true,
  })
);

app.use(express.json());

// Connect to the database
connectDB();

// Use routes
app.use("/products", productRoutes);
app.use("/review", reviewRoutes);
app.use("/users", userRoutes);
app.use("/promos", promoRoutes);
app.use("/chats", chatRoutes);
app.use("/applys", applyRoutes);
app.use("/recentviews", recentview);
app.use("/blogs", blogsRouters);

app.get("/", (req, res) => {
  res.send("giftap Server Running");
});

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://giftap901.web.app"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);

  socket.on("error", (err) => {
    console.error("Socket error: ", err);
  });

  socket.on("sendMessage", (data) => {
    console.log("Message received: ", data);
    io.emit("receiveMessage", data);
  });

  socket.on("disconnect", (reason) => {
    console.log("A user disconnected: " + socket.id, "Reason:", reason);
  });
});

server.listen(port, () => {
  console.log(`giftap sitting on server port ${port}`);
});

process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("There was an uncaught error:", err);
});
