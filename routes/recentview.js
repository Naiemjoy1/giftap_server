const express = require("express");
const router = express.Router();
const { client } = require("../config/db");
const { ObjectId } = require("mongodb");
const recentviewCollection = client.db("giftap_DB").collection("recentview");

router.get("/", async (req, res) => {
  const result = await recentviewCollection.find().toArray();
  res.send(result);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await recentviewCollection.findOne(query);
  res.send(result);
});

router.post("/", async (req, res) => {
  const { productId, userID, email } = req.body;

  try {
    const productCollection = client.db("giftap_DB").collection("products");
    const product = await productCollection.findOne({
      _id: new ObjectId(productId),
    });

    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    const recentView = {
      userID,
      email,
      productId,
      name: product.name,
      image: product.image.cardImg,
      price: product.price,
      category: product.category,
      discount: product.discount,
      quantity: product.quantity,
      image: product.image,
      priceGroup: product.priceGroup,
      viewedAt: new Date(),
    };

    const existingView = await recentviewCollection.findOne({
      userID,
      productId,
    });

    if (existingView) {
      const result = await recentviewCollection.updateOne(
        { _id: existingView._id },
        { $set: { viewedAt: new Date() } }
      );
      res.send({ message: "Recent view updated", result });
    } else {
      const recentViews = await recentviewCollection
        .find({ userID })
        .sort({ viewedAt: -1 })
        .toArray();

      if (recentViews.length >= 5) {
        const oldestView = recentViews[recentViews.length - 1];
        await recentviewCollection.deleteOne({ _id: oldestView._id });
      }

      const result = await recentviewCollection.insertOne(recentView);
      res.send(result);
    }
  } catch (error) {
    res.status(500).send({ message: "Error storing recent view", error });
  }
});

module.exports = router;
