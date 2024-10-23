const express = require("express");
const router = express.Router();
const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const sellerCollection = client.db("giftap_DB").collection("sellers");
const applyCollection = client.db("giftap_DB").collection("applys");
// const productsCollection = client.db("giftap_DB").collection("products");

router.get("/", async (req, res) => {
  const result = await sellerCollection.find().toArray();
  res.send(result);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await sellerCollection.findOne(query);
  res.send(result);
});

// router.get('/product', async (req, res) =>{
//   // const userId = req.query.userId
//   // const query = {userId: userId}
//   const result = await productsCollection.find().toArray()
//   res.send(result)
// })

// app.get('/favorite', async(req,res) =>{
//   const email = req.query.email
//   const query = {email: email}
//   const result = await favoriteCollection.find(query).toArray();
//   res.send(result)
// })

router.post("/", async (req, res) => {
  const sellerData = req.body;

  try {
    const sellerResult = await sellerCollection.insertOne(sellerData);

    if (sellerResult.insertedId) {
      const applyQuery = { userID: sellerData.userID };
      const deleteResult = await applyCollection.deleteOne(applyQuery);

      res.status(201).send({
        success: true,
        message: "Seller details successfully saved and application deleted.",
        deletedCount: deleteResult.deletedCount,
      });
    } else {
      res
        .status(400)
        .send({ success: false, message: "Failed to save seller details." });
    }
  } catch (error) {
    console.error("Error saving seller details:", error);
    res.status(500).send({
      success: false,
      message: "An error occurred while saving seller details.",
    });
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await sellerCollection.deleteOne(query);
  res.send(result);
});

module.exports = router;
