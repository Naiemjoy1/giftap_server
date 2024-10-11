const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { client } = require("../config/db");

const wishlistCollection = client.db("giftap_DB").collection("wishlists");

router.get("/", async (req, res) => {
  const result = await wishlistCollection.find().toArray();
  res.send(result);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await wishlistCollection.findOne(query);
  res.send(result);
});

router.post("/", async (req, res) => {
  const Wishlist = req.body;
  const result = await wishlistCollection.insertOne(Wishlist);
  res.send(result);
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await wishlistCollection.deleteOne(query);
  res.send(result);
});

router.delete("/product/:productId", async (req, res) => {
  const productId = req.params.productId;
  const query = { productId: productId };
  const result = await wishlistCollection.deleteOne(query);
  res.send(result);
});

module.exports = router;
