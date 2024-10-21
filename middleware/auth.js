const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  console.log("Inside verifyToken:", req.headers.authorization);
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "Forbidden access" });
  }
  const token = req.headers.authorization.split(" ")[1];
  console.log("Extracted token:", token); // Log the extracted token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.error("Token verification failed:", err); // Log the error
      return res.status(401).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
};

module.exports = { verifyToken} 