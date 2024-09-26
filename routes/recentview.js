const express = require("express");
const router = express.Router();
const { client } = require("../config/db");
const recentviewCollection = client.db("giftap_DB").collection("recentview");

router.get("/", async (req, res) => {
  const result = await recentviewCollection.find().toArray();
  res.send(result);
});

module.exports = router;
