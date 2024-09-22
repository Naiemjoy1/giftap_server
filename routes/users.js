const express = require("express");
const router = express.Router();
const { client } = require("../config/db");

const usersCollection = client.db("giftap_DB").collection("users");

router.get("/", async (req, res) => {
  const result = await usersCollection.find().toArray();
  res.send(result);
});

router.post("/", async (req, res) => {
  const user = req.body;
  const result = await usersCollection.insertOne(user);
  res.send(result);
});

module.exports = router;
