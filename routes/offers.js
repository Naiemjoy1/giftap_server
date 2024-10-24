
const express = require("express");
const router = express.Router();
const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const offerCollection = client.db("giftap_DB").collection("offers");

router.post("/offers",async(req,res)=>{
    const newOffer = req.body;
    const result = await offerCollection.insertOne(newOffer);
    res.send(result);
})

router.get("/offers",async(req,res)=>{
   const result = await offerCollection.find().toArray();
   res.send(result);
})