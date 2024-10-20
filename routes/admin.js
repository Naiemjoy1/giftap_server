const express = require("express");
const router = express.Router();
const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const paymentCollection = client.db("giftap_DB").collection("payments");
const usersCollection = client.db("giftap_DB").collection("users");
const productCollection = client.db("giftap_DB").collection("products");

router.get("/statistics", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalEarnings = await paymentCollection
      .aggregate([
        { $match: { status: "success" } },
        { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } },
      ])
      .toArray();
    const totalRevenue = totalEarnings[0]?.total || 0;

    const todaySales = await paymentCollection
      .aggregate([
        { $match: { status: "success", date: { $gte: today } } },
        { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } },
      ])
      .toArray();
    const todayRevenue = todaySales[0]?.total || 0;

    const totalSuccessfulPaymentsCount = await paymentCollection.countDocuments(
      { status: "success" }
    );

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const totalNewlyAddedProductsCount = await productCollection.countDocuments(
      {
        createdAt: { $gte: thirtyDaysAgo },
      }
    );

    const deliveryStatuses = await paymentCollection
      .aggregate([
        { $match: { status: "success" } },
        { $unwind: "$delivery" },
        {
          $group: {
            _id: "$delivery",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const deliverySummary = {
      canceled: deliveryStatuses.find((d) => d._id === "canceled")?.count || 0,
      home: deliveryStatuses.find((d) => d._id === "home")?.count || 0,
      delivered:
        deliveryStatuses.find((d) => d._id === "delivered")?.count || 0,
    };

    const totalUsers = await usersCollection.countDocuments();
    const totalProducts = await productCollection.countDocuments();

    const userTypeCounts = await usersCollection
      .aggregate([
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const userSummary = {};
    userTypeCounts.forEach((typeGroup) => {
      userSummary[typeGroup._id] = typeGroup.count;
    });

    const startOfCurrentMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );
    const totalCurrentMonthRevenue = await paymentCollection
      .aggregate([
        { $match: { status: "success", date: { $gte: startOfCurrentMonth } } },
        { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } },
      ])
      .toArray();
    const currentMonthRevenue = totalCurrentMonthRevenue[0]?.total || 0;

    const startOfPreviousMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const endOfPreviousMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    );
    const totalPreviousMonthRevenue = await paymentCollection
      .aggregate([
        {
          $match: {
            status: "success",
            date: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
          },
        },
        { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } },
      ])
      .toArray();
    const previousMonthRevenue = totalPreviousMonthRevenue[0]?.total || 0;

    const revenueIncrease = currentMonthRevenue - previousMonthRevenue;
    const revenueIncreasePercentage =
      previousMonthRevenue > 0
        ? ((revenueIncrease / previousMonthRevenue) * 100).toFixed(2)
        : currentMonthRevenue > 0
        ? 100
        : 0;

    res.json({
      totalRevenue,
      todayRevenue,
      deliverySummary,
      totalUsers,
      totalProducts,
      userSummary,
      totalSuccessfulPayments: totalSuccessfulPaymentsCount,
      totalNewlyAddedProducts: totalNewlyAddedProductsCount,
      currentMonthRevenue,
      previousMonthRevenue,
      revenueIncrease,
      revenueIncreasePercentage,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error.message);
    res.status(500).json({ error: "Failed to fetch statistics." });
  }
});

router.get("/featured-products", async (req, res) => {
  try {
    const paymentData = await paymentCollection
      .find({ status: "success" })
      .toArray();

    const productIdCount = {};
    paymentData.forEach((payment) => {
      payment.productId.forEach((id) => {
        productIdCount[id] = (productIdCount[id] || 0) + 1;
      });
    });

    const featuredProductIds = Object.keys(productIdCount).filter(
      (id) => productIdCount[id] > 1
    );

    const featuredProducts = await productCollection
      .find({ _id: { $in: featuredProductIds.map((id) => new ObjectId(id)) } })
      .toArray();

    res.json(featuredProducts);
  } catch (error) {
    console.error("Error fetching featured products:", error.message);
    res.status(500).json({ error: "Failed to fetch featured products." });
  }
});

router.get("/newly-added-products", async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newlyAddedProducts = await productCollection
      .find({ createdAt: { $gte: thirtyDaysAgo } })
      .toArray();

    res.json(newlyAddedProducts);
  } catch (error) {
    console.error("Error fetching newly added products:", error.message);
    res.status(500).json({ error: "Failed to fetch newly added products." });
  }
});

router.get("/day-wise-payments", async (req, res) => {
  try {
    const dayWisePayments = await paymentCollection
      .aggregate([
        {
          $match: { status: "success" },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$date" },
            },
            totalAmount: { $sum: { $toDouble: "$amount" } },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: -1 },
        },
      ])
      .toArray();

    const result = dayWisePayments.map((payment) => ({
      date: new Date(payment._id).toISOString(),
      totalAmount: payment.totalAmount,
      count: payment.count,
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching day-wise payments:", error.message);
    res.status(500).json({ error: "Failed to fetch day-wise payments." });
  }
});

module.exports = router;
