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
      { createdAt: { $gte: thirtyDaysAgo } }
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

    const currentMonthSuccessfulPayments =
      await paymentCollection.countDocuments({
        status: "success",
        date: { $gte: startOfCurrentMonth },
      });

    const previousMonthSuccessfulPayments =
      await paymentCollection.countDocuments({
        status: "success",
        date: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
      });

    const revenueIncrease = currentMonthRevenue - previousMonthRevenue;
    const revenueIncreasePercentage =
      previousMonthRevenue > 0
        ? ((revenueIncrease / previousMonthRevenue) * 100).toFixed(2)
        : currentMonthRevenue > 0
        ? 100
        : 0;

    const successfulPaymentsIncrease =
      currentMonthSuccessfulPayments - previousMonthSuccessfulPayments;
    const successfulPaymentsIncreasePercentage =
      previousMonthSuccessfulPayments > 0
        ? (
            (successfulPaymentsIncrease / previousMonthSuccessfulPayments) *
            100
          ).toFixed(2)
        : currentMonthSuccessfulPayments > 0
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
      revenueIncreasePercentage,
      currentMonthSuccessfulPayments,
      previousMonthSuccessfulPayments,
      successfulPaymentsIncreasePercentage,
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
      totalAmount: parseFloat(payment.totalAmount.toFixed(2)),
      count: payment.count,
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching day-wise payments:", error.message);
    res.status(500).json({ error: "Failed to fetch day-wise payments." });
  }
});

router.get("/orders", async (req, res) => {
  try {
    // Fetch successful payments
    const orders = await paymentCollection
      .aggregate([
        { $match: { status: "success" } }, // Only successful payments
        {
          $project: {
            _id: 0, // Exclude MongoDB's default ID
            productId: 1, // Include productId array
            delivery: 1, // Include delivery array
            date: 1, // Include date
          },
        },
        { $sort: { date: -1 } }, // Sort by date in descending order
      ])
      .toArray();

    // Prepare productId array
    const allProductIds = orders
      .reduce((acc, order) => acc.concat(order.productId), [])
      .map((id) => new ObjectId(id)); // Convert productIds to ObjectId

    // Fetch products from productCollection that match the productIds
    const products = await productCollection
      .find({ _id: { $in: allProductIds } })
      .toArray();

    // Create a product map for easy lookup
    const productMap = {};
    products.forEach((product) => {
      productMap[product._id.toString()] = product;
    });

    // Helper function to calculate price after discount
    const calculateDiscountPrice = (price, discount) => {
      if (!discount || discount <= 0) return price;
      return price - (price * discount) / 100;
    };

    // Format the response
    const formattedOrders = orders.map((order) => ({
      date: new Date(order.date).toISOString(), // Convert date to ISO format
      products: order.productId.map((id) => {
        const product = productMap[id];
        let price = product.price;

        // If product has a priceGroup (digital gift), calculate tiered price
        if (
          product.category === "digital gift" &&
          product.priceGroup?.length > 0
        ) {
          // Calculate prices for each tier in the priceGroup
          const tierPrices = product.priceGroup.map((tier) => ({
            tier: tier.tier,
            originalPrice: tier.price.amount,
            discountedPrice: calculateDiscountPrice(
              tier.price.amount,
              product.discount
            ),
            duration: tier.price.duration,
            currency: tier.price.currency,
            quantity: tier.quantity, // Include quantity available
          }));

          // Return the product with tier prices included
          return {
            ...product,
            priceGroup: tierPrices, // Add calculated price for each tier
          };
        }

        // For non-digital products, apply the discount
        const discountedPrice = calculateDiscountPrice(price, product.discount);

        return {
          ...product,
          originalPrice: price,
          discountedPrice, // Include calculated price after discount
        };
      }),
      delivery: order.delivery, // Include delivery data
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
});

module.exports = router;
