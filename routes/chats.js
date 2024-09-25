const express = require("express");
const router = express.Router();
const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const chatCollection = client.db("giftap_DB").collection("chats");

// Get all chats
router.get("/", async (req, res) => {
  const result = await chatCollection.find().toArray();
  res.send(result);
});

// Get chat by ID
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };

  try {
    const result = await chatCollection.findOne(query);
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(404).send({ message: "Chat not found" });
    }
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).send({ message: "Error fetching chat" });
  }
});

// Create a new chat
router.post("/", async (req, res) => {
  const chatData = req.body;
  const result = await chatCollection.insertOne(chatData);
  res.send(result);
});

// Update chat messages
router.patch("/:id", async (req, res) => {
  const chatId = req.params.id;
  const updateData = req.body;

  try {
    const result = await chatCollection.updateOne(
      { _id: new ObjectId(chatId) },
      updateData
    );

    if (result.modifiedCount === 1) {
      const updatedChat = await chatCollection.findOne({
        _id: new ObjectId(chatId),
      });
      return res.status(200).send(updatedChat);
    } else {
      return res.status(404).send({ message: "Chat not found" });
    }
  } catch (error) {
    console.error("Error updating chat:", error);
    res.status(500).send({ message: "Error updating chat" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };

  try {
    const result = await chatCollection.deleteOne(query);
    if (result.deletedCount === 1) {
      res.status(200).send({ message: "Chat deleted successfully" });
    } else {
      res.status(404).send({ message: "Chat not found" });
    }
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).send({ message: "Error deleting chat" });
  }
});

module.exports = router;
