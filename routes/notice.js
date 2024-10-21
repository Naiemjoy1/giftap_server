const express = require("express");
const router = express.Router();

const { client } = require("../config/db");

const noticeCollection = client.db("giftap_DB").collection("notice");

router.get("/", async (req, res) => {
  const result = await noticeCollection.find().toArray();
  res.send(result);
});



router.post("/", async (req, res) => {
    const noticeData = req.body;
    const result = await noticeCollection.insertOne(noticeData);
    res.send(result);
  });

module.exports = router;
