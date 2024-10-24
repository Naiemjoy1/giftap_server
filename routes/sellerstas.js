const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { client } = require("../config/db");

const usersCollection = client.db("giftap_DB").collection("users");
const productCollection = client.db("giftap_DB").collection("products");

router.post("/statistics", async (req, res) => {
  try {
    // Fetch all users
    const users = await usersCollection.find({}).toArray();
    console.log("Users fetched:", users);

    // Fetch all products
    const products = await productCollection.find({}).toArray();
    console.log("Products fetched:", products);

    // Check if data was retrieved
    if (!users || users.length === 0) {
      console.log("No users found");
      return res.status(404).send({ message: "No users found" });
    }

    if (!products || products.length === 0) {
      console.log("No products found");
      return res.status(404).send({ message: "No products found" });
    }

    // Create an array to hold user-product mapping
    const userProductMapping = [];

    // Loop through each user
    users.forEach((user) => {
      const userIdStr = user._id.toString();

      // Log user ID
      console.log("Checking user:", userIdStr);

      // Filter products that match the userId
      const matchingProducts = products.filter((product) => {
        console.log(
          `Checking product ${product._id} with userId ${product.userId}`
        );
        return product.userId === userIdStr;
      });

      console.log(`Matching products for user ${userIdStr}:`, matchingProducts);

      // If there are matching products, push the mapping to the array
      if (matchingProducts.length > 0) {
        userProductMapping.push({
          userId: userIdStr,
          productIds: matchingProducts.map((product) => product._id.toString()),
        });
      }
    });

    // Log the final user-product mapping
    console.log("User-Product Mapping:", userProductMapping);

    // Return the result
    res.send({ userProductMapping });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).send({ message: "An error occurred", error });
  }
});

module.exports = router;
