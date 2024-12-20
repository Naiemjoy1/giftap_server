const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB } = require("./config/db");
const productRoutes = require("./routes/products");
const userRoutes = require("./routes/users");
const promoRoutes = require("./routes/promos");
const chatRoutes = require("./routes/chats");
const applyRoutes = require("./routes/applys");
const recentview = require("./routes/recentview");
const blogsRouters = require("./routes/blogs");
const catrsRouters = require("./routes/carts");
const wishlistsRouters = require("./routes/wishlists");
const paymentssRouters = require("./routes/payments");
const emailRoutes = require("./routes/email");
const sellersRoutes = require("./routes/sellers");
const reviewsRoutes = require("./routes/reviews");
const bannerRoutes = require("./routes/banner");
const stripePaymentRoute = require("./routes/stripePayment");
const sellerRoutes = require("./routes/sellers");
const reviewRoutes = require("./routes/reviews");
const adminRoutes = require("./routes/admin");
const noticeRoutes = require("./routes/notice");
const complainRoutes = require("./routes/complain");
const sellerstatRoutes = require("./routes/sellerstas");
const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const port = process.env.PORT || 3000;

// Create an HTTP server
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://giftap901.web.app"],
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://giftap901.web.app",
      "https://giftap901.firebaseapp.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to the database
connectDB();

app.post("/jwt", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  res.send({ token });
});

// Use routes
app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/promos", promoRoutes);
app.use("/chats", chatRoutes);
app.use("/applys", applyRoutes);
app.use("/recentviews", recentview);
app.use("/blogs", blogsRouters);
app.use("/carts", catrsRouters);
app.use("/wishlists", wishlistsRouters);
app.use("/payments", paymentssRouters);
app.use("/email", emailRoutes);
app.use("/sellers", sellersRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/banner", bannerRoutes);
app.use("/stripePayment", stripePaymentRoute);
app.use("/sellers", sellerRoutes);
app.use("/reviews", reviewRoutes);
app.use("/notice", noticeRoutes);
app.use("/complain", complainRoutes);
app.use("/seller", sellerstatRoutes);
app.use("/admin", adminRoutes);

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
