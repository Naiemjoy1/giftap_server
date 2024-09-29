const express = require("express");
const router = express.Router();
const { client } = require("../config/db");
const { ObjectId } = require("mongodb");
const recentviewCollection = client.db("giftap_DB").collection("recentview");

router.get("/", async (req, res) => {
  const result = await recentviewCollection.find().toArray();
  res.send(result);
});

router.post("/", async (req, res) => {
  const info = req.body;
  const productId = info.id;

  try {
    const existingProduct = await recentviewCollection.findOne({
      id: productId,
    });

    if (existingProduct) {
      await recentviewCollection.deleteOne({ _id: new ObjectId(productId) });
      console.log(`Deleted existing product with _id: ${productId}`);
    }

    const result = await recentviewCollection.insertOne(info);
    res.status(201).send(result);
  } catch (error) {
    console.error("Error checking, deleting or inserting product:", error);
    res.status(500).send({ message: "Server error" });
  }
});

module.exports = router;
