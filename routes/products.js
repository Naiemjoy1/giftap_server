const express = require("express");
const router = express.Router();
const { client } = require("../config/db");

const productCollection = client.db("giftap_DB").collection("products");

router.get("/", async (req, res) => {
  const result = await productCollection.find().toArray();
  res.send(result);
});

module.exports = router;

// addddddddddd branch
