const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { client } = require("../config/db");

const reviewCollection = client.db("giftap_DB").collection("reviews");

router.get("/", async (req, res) => {
  const result = await reviewCollection.find().toArray();
  res.send(result);
});

router.get("/", async (req, res) => {
  const result = await reviewCollection.find().toArray();
  res.send(result);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await reviewCollection.findOne(query);
  res.send(result);
});

router.post("/", async (req, res) => {
  const reviewData = req.body;
  const result = await reviewCollection.insertOne(reviewData);
  res.send(result);
});

module.exports = router;
