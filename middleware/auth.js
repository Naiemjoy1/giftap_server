const jwt = require("jsonwebtoken");
const { client } = require("../config/db");

const usersCollection = client.db("giftap_DB").collection("users");

// Middleware: Verify JWT token
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

// Middleware: Verify Admin
const verifyAdmin = async (req, res, next) => {
  const email = req.decoded.email;
  const user = await usersCollection.findOne({ email });
  if (user?.role !== "admin") {
    return res.status(403).send({ message: "Forbidden access" });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };

// giftap_server/
// │
// ├── index.js
// ├── routes/
// │   ├── products.js
// │   └── promos.js
// │   └── reviews.js
// │   └── users.js
// ├── config/
// │   └── db.js
// └── middleware/
//     └── auth.js

// Comment Added By Rasel
