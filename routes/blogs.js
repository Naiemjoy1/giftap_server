const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { client } = require("../config/db");

const blogCollection = client.db("giftap_DB").collection("blogs");

router.get("/", async (req, res) => {
  const filter = req.query;

  const searchTerm = typeof filter.search === "string" ? filter.search : "";

  const query = {
    blogTitle: { $regex: searchTerm, $options: "i" },
  };

  try {
    const result = await blogCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blogs", error });
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await blogCollection.findOne(query);
  res.send(result);
});

router.get("/:id/blogComments", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await blogCollection.findOne(query);
  res.send(result);
});

// Blog Comment Added
router.post("/:id/comments", async (req, res) => {
  const blogId = req.params.id;
  const newComment = req.body;

  try {
    const result = await blogCollection.updateOne(
      { _id: new ObjectId(blogId) },
      { $push: { blogComments: newComment } }
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: "Comment added successfully!" });
    } else {
      res.status(404).json({ message: "Blog not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment", error });
  }
});

module.exports = router;
