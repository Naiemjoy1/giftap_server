const express = require("express");
const router = express.Router();
const { client } = require("../config/db");

const promoCollection = client.db("giftap_DB").collection("promos");

router.get("/", async (req, res) => {
  const result = await promoCollection.find().toArray();
  res.send(result);
});

module.exports = router;

// addddddddddd branch
