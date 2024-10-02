const express = require("express");
const router = express.Router();
const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const applyCollection = client.db("giftap_DB").collection("applys");

router.get("/", async (req, res) => {
  const result = await applyCollection.find().toArray();
  res.send(result);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await applyCollection.findOne(query);
  res.send(result);
});

router.post("/", async (req, res) => {
  const applyData = req.body;
  const result = await applyCollection.insertOne(applyData);
  res.send(result);
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await applyCollection.deleteOne(query);
  res.send(result);
});

module.exports = router;
