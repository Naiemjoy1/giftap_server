const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB } = require("./config/db");
const productRoutes = require("./routes/products");
const userRoutes = require("./routes/users");
const promoRoutes = require("./routes/promos");
const chatRoutes = require("./routes/chats");
const applyRoutes = require("./routes/applys");
const recentViewRoutes = require("./routes/recentview");
const blogRoutes = require("./routes/blogs");
const cartRoutes = require("./routes/carts");
const wishlistRoutes = require("./routes/wishlists");
const paymentRoutes = require("./routes/payments");
const emailRoutes = require("./routes/email");
const sellerRoutes = require("./routes/sellers");
const reviewRoutes = require("./routes/reviews");
const adminRoutes = require("./routes/admin");
const noticeRoutes = require("./routes/notice");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 3000;

// Create an HTTP server
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "https://giftap901.web.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to the database
connectDB();

// JWT creation endpoint
app.post("/jwt", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
  res.send({ token });
});

// Use routes
app.use("/admin", adminRoutes);
app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/promos", promoRoutes);
app.use("/chats", chatRoutes);
app.use("/applys", applyRoutes);
app.use("/recentviews", recentViewRoutes);
app.use("/blogs", blogRoutes);
app.use("/carts", cartRoutes);
app.use("/wishlists", wishlistRoutes);
app.use("/payments", paymentRoutes);
app.use("/email", emailRoutes);
app.use("/sellers", sellerRoutes);
app.use("/reviews", reviewRoutes);
app.use("/notice", noticeRoutes );

// Root endpoint
app.get("/", (req, res) => {
  res.send("giftap Server Running");
});

// Initialize socket.io
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://giftap901.web.app",
      "https://giftap-server.vercel.app",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);

  socket.on("error", (err) => {
    console.error("Socket error: ", err);
  });

  socket.on("sendMessage", (data) => {
    console.log("Message received: ", data);
    io.emit("receiveMessage", data);
  });

  socket.on("chatEnded", (data) => {
    console.log("Chat ended for chat ID: ", data.chatId);
    io.emit("chatEnded", { chatId: data.chatId });
  });

  socket.on("disconnect", (reason) => {
    console.log("A user disconnected: " + socket.id, "Reason:", reason);
  });
});

// Start the server
server.listen(port, () => {
  console.log(`giftap sitting on server port ${port}`);
});

// Handle unhandled rejections and uncaught exceptions
process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("There was an uncaught error:", err);
});
// bnnn