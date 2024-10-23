const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { client } = require("../config/db");

const bannerCollection = client.db("giftap_DB").collection("banner");

router.post("/", async (req, res) => {
    const bannerData = req.body;
    const result = await bannerCollection.insertOne(bannerData);
    res.send(result);
});

router.get("/", async (req, res) => {
    const result = await bannerCollection.find().toArray();
    res.send(result)
})


router.patch('/:id', async (req, res) => {
    const id = req.params.id;

    // Ensure the provided ID is valid
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
    }

    const filter = { _id: new ObjectId(id) };
    const updatedDoc = {
        $set: {
            type: 'running', // Change 'type' field to 'running'
        },
    };

    try {
        const result = await bannerCollection.updateOne(filter, updatedDoc);

        // Check if the document was actually updated
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        res.json({
            message: 'Banner status updated to running',
            result,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating banner status',
            error,
        });
    }
});



module.exports = router;