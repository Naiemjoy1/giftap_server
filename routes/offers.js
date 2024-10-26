
const express = require("express");
const router = express.Router();
const { client } = require("../config/db");
const { ObjectId } = require("mongodb");
const { verifyToken } = require("../middleware/auth");
const offerCollection = client.db("giftap_DB").collection("offers");

router.post("/offers", async (req, res) => {
    try {
        const newOffer = req.body;
        console.log(newOffer);
        const result = await offerCollection.insertOne(newOffer);
        res.status(201).send(result);
    } catch (error) {
      
        res.status(500).send({ error: 'Failed to submit offer.' });
    }
});
router.get("/offers",async(req,res)=>{
   const result = await offerCollection.find().toArray();
   res.send(result);
})
module.exports = router;