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

module.exports = router;
