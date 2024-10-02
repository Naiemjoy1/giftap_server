const express = require('express');
const router = express.router()
const { client } = require('../config/db')

const reviewCollection = client.db("giftap_DB").collection("review")

router.get("/reviews", async(req,res) =>{
    const result = await reviewCollection.find().toArray()
    res.send(result)
})

module.exports = router