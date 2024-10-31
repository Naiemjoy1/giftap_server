const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { client } = require("../config/db");

const productCollection = client.db("giftap_DB").collection("products");

router.get("/", async (req, res) => {
  const result = await productCollection.find().toArray();
  res.send(result);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await productCollection.findOne(query);
  res.send(result);
});

router.post("/", async (req, res) => {
  const productData = {
    ...req.body,
    createdAt: new Date(),
  };
  const result = await productCollection.insertOne(productData);
  res.send(result);
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const productData = req.body;
  const query = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: productData,
  };
  const result = await productCollection.updateOne(query, updateDoc);
  res.send(result);
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await productCollection.deleteOne(query);
  res.send(result);
});

router.get("/category/:categoryName", async (req, res) => {
  const result = await productCollection
    .find({ category: req.params.categoryName })
    .toArray();
  res.send(result);
});

module.exports = router;
