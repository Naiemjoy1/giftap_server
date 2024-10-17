// middleware/auth.js
const jwt = require("jsonwebtoken");
const { usersCollection } = require("../models/User");

// Generate JWT Token
app.post("/jwt", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
  res.send({ token });
});

// Verify JWT Token Middleware
const verifyToken = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
};

// Verify Admin Middleware
const verifyAdmin = async (req, res, next) => {
  const email = req.decoded.email;
  const user = await usersCollection.findOne({ email });
  if (user?.role !== "admin") {
    return res.status(403).send({ message: "Forbidden access" });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };
