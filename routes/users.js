const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const usersCollection = client.db("giftap_DB").collection("users");

// Fetch all users
router.get("/", async (req, res) => {
  const result = await usersCollection.find().toArray();
  res.send(result);
});

router.patch("/:id", async (req, res) => {
  const id = req.params.id;
  const { type } = req.body;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      type: type,
    },
  };
  const result = await usersCollection.updateOne(filter, updateDoc);
  res.send(result);
});

// Create or sign in a user
router.post("/", async (req, res) => {
  const user = req.body;

  try {
    const existingUser = await usersCollection.findOne({ email: user.email });

    if (existingUser) {
      return res
        .status(200)
        .send({ message: "User already exists", user: existingUser });
    }

    if (user.provider) {
      const newUser = {
        name: user.name,
        email: user.email,
        createdDate: new Date().toISOString(),
        status: "active",
        type: "user",
      };

      const result = await usersCollection.insertOne(newUser);
      return res.status(201).send({
        message: "User created successfully",
        insertedId: result.insertedId,
      });
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser = {
      ...user,
      password: hashedPassword,
    };

    const result = await usersCollection.insertOne(newUser);
    res.status(201).send({
      message: "User created successfully",
      insertedId: result.insertedId,
    });
  } catch (error) {
    res.status(500).send({ message: "An error occurred", error });
  }
});

// Fetch a user's type by email
router.get("/type/:email", async (req, res) => {
  const email = req.params.email;

  try {
    const user = await usersCollection.findOne(
      { email },
      { projection: { type: 1 } }
    );

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send({ type: user.type });
  } catch (error) {
    console.error("Error fetching user type:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = router;
