const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB } = require("./config/db");
const productRoutes = require("./routes/products");
const userRoutes = require("./routes/users");
const app = express();
const port = process.env.PORT || 3000;

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

<<<<<<< HEAD
// Use routes
app.use("/products", productRoutes);
app.use("/api/users", userRoutes);
=======
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // collection
    const productCollection = client.db("giftap_DB").collection("products");

    // products api
    app.get("/products", async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    });

    // emni
    // app.get("/users", verifyToken, verifyAdmin, async (req, res) => {
    //     const result = await userCollection.find().toArray();
    //     res.send(result);
    //   });

    // emni

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
>>>>>>> 2406306dc92c666f0242b6246c09b581c0e57976

app.get("/", (req, res) => {
  res.send("giftap Server Running");
});

app.listen(port, () => {
  console.log(`giftap sitting on server port ${port}`);
});
