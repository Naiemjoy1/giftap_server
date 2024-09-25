const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB } = require("./config/db");
const productRoutes = require("./routes/products");
const userRoutes = require("./routes/users");
const reviewRoutes = require("./routes/reviews");
const promoRoutes = require("./routes/promos");
const chatRoutes = require("./routes/chats");
const http = require("http");

// Import the socket module
const socketConnection = require("./socket/socket");

const app = express();
const port = process.env.PORT || 3000;

// Create an HTTP server
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://giftap901.web.app",
      "https://giftap901.firebaseapp.com",
    ],
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

app.get("/", (req, res) => {
  res.send("giftap Server Running");
});

// Initialize Socket.io
socketConnection(server);

// Listen on the server
server.listen(port, () => {
  console.log(`giftap sitting on server port ${port}`);
});
