const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { client } = require("../config/db");

const cartsCollection = client.db("giftap_DB").collection("carts");

router.get("/", async (req, res) => {
  const result = await cartsCollection.find().toArray();
  res.send(result);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await cartsCollection.findOne(query);
  res.send(result);
});

router.post("/", async (req, res) => {
  const { email, productId, quantity } = req.body;

  try {
    const existingCartItem = await cartsCollection.findOne({
      email,
      productId,
    });

    if (existingCartItem) {
      const updatedQuantity = existingCartItem.quantity + quantity;
      const result = await cartsCollection.updateOne(
        { _id: existingCartItem._id },
        { $set: { quantity: updatedQuantity } }
      );
      res.send({ message: "Quantity updated", result });
    } else {
      const result = await cartsCollection.insertOne(req.body);
      res.send({ message: "New item added", result });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error adding or updating cart item", error });
  }
});

router.patch("/:id", async (req, res) => {
  const id = req.params.id;
  const { message, delivery } = req.body;

  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      message: message,
      delivery: delivery,
    },
  };

  const result = await cartsCollection.updateOne(filter, updateDoc);
  res.send(result);
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await cartsCollection.deleteOne(query);
  res.send(result);
});

module.exports = router;
