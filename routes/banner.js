const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { client } = require("../config/db");

const bannerCollection = client.db("giftap_DB").collection("banner");

router.post("/", async (req, res) => {
    const reviewData = req.body;
    const result = await bannerCollection.insertOne(reviewData);
    res.send(result);
});


module.exports = router;