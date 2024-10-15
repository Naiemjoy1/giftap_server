const express = require("express");
const router = express.Router();
const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const promoCollection = client.db("giftap_DB").collection("promos");

router.get("/", async (req, res) => {
  await updatePromoStatuses();
  const result = await promoCollection.find().toArray();
  res.send(result);
});

router.post("/", async (req, res) => {
  const promoData = req.body;

  if (promoData.status === "active") {
    await promoCollection.updateMany(
      { status: "active" },
      { $set: { status: "inactive" } }
    );
  }

  const result = await promoCollection.insertOne(promoData);
  res.send(result);
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await promoCollection.deleteOne(query);
  res.send(result);
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updates = { status };
    if (status) {
      updates.finishDate = new Date();
    }

    const result = await promoCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    res.send(result);
  } catch (error) {
    console.error("Error updating promo:", error);
    res.status(500).send({ message: "Failed to update promo" });
  }
});

const updatePromoStatuses = async () => {
  const currentDate = new Date();
  const promos = await promoCollection.find().toArray();

  const updates = promos.map((promo) => {
    let newStatus = promo.status;

    if (new Date(promo.finishDate) < currentDate) {
      newStatus = "inactive";
    } else if (
      new Date(promo.startDate) <= currentDate &&
      promo.status === "inactive"
    ) {
      newStatus = "active";
    }

    return promo.status !== newStatus
      ? promoCollection.updateOne(
          { _id: new ObjectId(promo._id) },
          { $set: { status: newStatus } }
        )
      : null;
  });

  await Promise.all(updates);
};

module.exports = router;
