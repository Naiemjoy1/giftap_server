const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { client } = require("../config/db");

const bannerCollection = client.db("giftap_DB").collection("banner");

router.post("/", async (req, res) => {
    const bannerData = req.body;
    const result = await bannerCollection.insertOne(bannerData);
    res.send(result);
});

router.get("/", async (req, res) => {
    const result = await bannerCollection.find().toArray();
    res.send(result)
})


module.exports = router;