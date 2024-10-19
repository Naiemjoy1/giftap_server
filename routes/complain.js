const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { client } = require("../config/db");

const complainCollection = client.db("giftap_DB").collection("complain");

router.get("/", async (req, res) => {
    const result = await complainCollection.find().toArray();
    res.send(result);
});

// Save MongoDB complainCollection
router.post("/", async (req, res) => {
    const productData = req.body;
    const result = await complainCollection.insertOne(productData);
    res.send(result);
});


module.exports = router;
