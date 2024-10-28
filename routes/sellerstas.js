const express = require("express");
const router = express.Router();
const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const paymentCollection = client.db("giftap_DB").collection("payments");
const productCollection = client.db("giftap_DB").collection("products");

router.get("/seller-orders", async (req, res) => {
  try {
    const successfulOrders = await paymentCollection
      .find({ status: "success" })
      .toArray();
    const ordersWithProductData = [];

    for (const order of successfulOrders) {
      const productDetails = await productCollection
        .find({ _id: { $in: order.productId.map((id) => new ObjectId(id)) } })
        .toArray();

      const productsWithDiscountedPrice = productDetails.map(
        (product, index) => {
          let discountedPrice;

          if (product.category === "digital gift" && product.priceGroup) {
            const matchingTier = product.priceGroup.find(
              (tier) => tier.tier === order.tier[0]
            );
            if (matchingTier) {
              discountedPrice =
                matchingTier.price.amount * (1 - product.discount / 100);
            }
          } else {
            discountedPrice = product.price * (1 - product.discount / 100);
          }

          return {
            _id: product._id,
            userId: product.userId,
            store_name: product.store_name,
            category: product.category,
            name: product.name,
            sku: product.sku,
            price: discountedPrice
              ? parseFloat(discountedPrice.toFixed(2))
              : null,
            deliveryStatus: order.delivery[index],
          };
        }
      );

      const groupedProducts = productsWithDiscountedPrice.reduce(
        (groups, product) => {
          if (product.deliveryStatus !== "canceled") {
            if (!groups[product.store_name]) {
              groups[product.store_name] = [];
            }
            groups[product.store_name].push(product);
          }
          return groups;
        },
        {}
      );

      const userPriceTotals = productsWithDiscountedPrice.reduce(
        (totals, product) => {
          if (product.price && product.deliveryStatus !== "canceled") {
            if (!totals[product.store_name]) {
              totals[product.store_name] = {
                totalPrice: 0,
                userId: product.userId,
                date: order.date,
                count: 0,
                order: 1, // Set order to 1 per store entry
              };
            }
            // Sum up product prices per store
            totals[product.store_name].totalPrice += product.price;
            totals[product.store_name].count += 1;

            // Keep the most recent date for the store's order
            if (
              new Date(order.date) > new Date(totals[product.store_name].date)
            ) {
              totals[product.store_name].date = order.date;
            }
          }
          return totals;
        },
        {}
      );

      const deliverySummary = order.delivery.reduce(
        (summary, status) => {
          summary[status] = (summary[status] || 0) + 1;
          return summary;
        },
        { canceled: 0, home: 0, delivered: 0 }
      );

      // Count total orders per store name
      const totalOrdersPerStore = Object.keys(userPriceTotals).reduce(
        (count, store) => {
          count[store] = (count[store] || 0) + 1;
          return count;
        },
        {}
      );

      ordersWithProductData.push({
        date: order.date,
        deliverySummary,
        userPriceTotals,
        products: groupedProducts,
        totalOrders: totalOrdersPerStore, // Include total orders per store
      });
    }

    res.json(ordersWithProductData);
  } catch (error) {
    console.error(
      "Error fetching seller orders with product data:",
      error.message
    );
    res.status(500).json({ error: "Failed to fetch seller orders." });
  }
});

router.get("/seller-statistics", async (req, res) => {
  try {
    const successfulOrders = await paymentCollection
      .find({ status: "success" })
      .toArray();

    const statistics = {};
    const storeDeliverySummary = {};

    const productCountsByStore = await productCollection
      .aggregate([
        { $group: { _id: "$store_name", totalProducts: { $sum: 1 } } },
      ])
      .toArray();

    const productCountMap = {};
    productCountsByStore.forEach((store) => {
      productCountMap[store._id] = store.totalProducts;
    });

    const newProductsCountsByStore = await productCollection
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
            },
          },
        },
        { $group: { _id: "$store_name", newProductsCount: { $sum: 1 } } },
      ])
      .toArray();

    const newProductCountMap = {};
    newProductsCountsByStore.forEach((store) => {
      newProductCountMap[store._id] = store.newProductsCount;
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const today = now.toISOString().split("T")[0];

    for (const order of successfulOrders) {
      const orderDate = new Date(order.date);
      const year = orderDate.getFullYear();
      const month = orderDate.getMonth() + 1;
      const orderDateFormatted = orderDate.toISOString().split("T")[0];

      const productDetails = await productCollection
        .find({ _id: { $in: order.productId.map((id) => new ObjectId(id)) } })
        .toArray();

      const productsWithDiscountedPrice = productDetails.map((product) => {
        let discountedPrice;

        if (product.category === "digital gift" && product.priceGroup) {
          const matchingTier = product.priceGroup.find(
            (tier) => tier.tier === order.tier[0]
          );
          if (matchingTier) {
            discountedPrice =
              matchingTier.price.amount * (1 - product.discount / 100);
          }
        } else {
          discountedPrice = product.price * (1 - product.discount / 100);
        }

        return {
          store_name: product.store_name,
          userId: product.userId,
          price: discountedPrice
            ? parseFloat(discountedPrice.toFixed(2))
            : null,
          deliveryStatus: order.delivery[productDetails.indexOf(product)],
        };
      });

      productsWithDiscountedPrice.forEach((product) => {
        if (product.price) {
          const storeName = product.store_name;
          const userId = product.userId;

          if (!statistics[storeName]) {
            statistics[storeName] = {
              userId: userId,
              monthly: {},
              yearly: {},
              currentMonthTotal: 0,
              currentMonthCount: 0,
              previousMonthTotal: 0,
              previousMonthCount: 0,
              currentYearTotal: 0,
              currentYearCount: 0,
              previousYearTotal: 0,
              previousYearCount: 0,
              todayTotal: 0,
              todayCount: 0,
              grandTotal: 0,
              grandCount: 0,
              totalProducts: productCountMap[storeName] || 0,
              newProductsCount: newProductCountMap[storeName] || 0,
              dailyData: {},
              deliverySummary: { canceled: 0, home: 0, delivered: 0 },
            };
          }

          if (!statistics[storeName].dailyData[orderDateFormatted]) {
            statistics[storeName].dailyData[orderDateFormatted] = {
              totalPrice: 0,
              count: 0,
            };
          }
          statistics[storeName].dailyData[orderDateFormatted].totalPrice +=
            product.price;

          statistics[storeName].dailyData[orderDateFormatted].totalPrice =
            parseFloat(
              statistics[storeName].dailyData[
                orderDateFormatted
              ].totalPrice.toFixed(2)
            );
          statistics[storeName].dailyData[orderDateFormatted].count += 1;

          statistics[storeName].grandTotal += product.price;
          statistics[storeName].grandCount += 1;

          if (orderDateFormatted === today) {
            statistics[storeName].todayTotal += product.price;
            statistics[storeName].todayCount += 1;
          }

          if (!statistics[storeName].monthly[year]) {
            statistics[storeName].monthly[year] = {};
          }
          if (!statistics[storeName].monthly[year][month]) {
            statistics[storeName].monthly[year][month] = 0;
          }
          statistics[storeName].monthly[year][month] += product.price;

          if (!statistics[storeName].yearly[year]) {
            statistics[storeName].yearly[year] = 0;
          }
          statistics[storeName].yearly[year] += parseFloat(
            product.price.toFixed(2)
          );

          statistics[storeName].deliverySummary[product.deliveryStatus] =
            (statistics[storeName].deliverySummary[product.deliveryStatus] ||
              0) + 1;

          if (year === currentYear) {
            if (month === currentMonth) {
              statistics[storeName].currentMonthTotal += product.price;
              statistics[storeName].currentMonthCount += 1;
            } else if (month === currentMonth - 1) {
              statistics[storeName].previousMonthTotal += product.price;
              statistics[storeName].previousMonthCount += 1;
            }
            statistics[storeName].currentYearTotal += product.price;
            statistics[storeName].currentYearCount += 1;
          } else if (year === currentYear - 1) {
            statistics[storeName].previousYearTotal += product.price;
            statistics[storeName].previousYearCount += 1;
          }
        }
      });
    }

    for (const storeName in statistics) {
      const storeStats = statistics[storeName];

      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      for (const year in storeStats.monthly) {
        for (const month in storeStats.monthly[year]) {
          const monthIndex = parseInt(month) - 1;
          const monthName = monthNames[monthIndex];
          storeStats.monthly[year][monthName] = parseFloat(
            storeStats.monthly[year][month].toFixed(2)
          );
          delete storeStats.monthly[year][month];
        }
      }

      storeStats.currentMonthTotal = parseFloat(
        storeStats.currentMonthTotal.toFixed(2)
      );
      storeStats.previousMonthTotal = parseFloat(
        storeStats.previousMonthTotal.toFixed(2)
      );
      storeStats.currentYearTotal = parseFloat(
        storeStats.currentYearTotal.toFixed(2)
      );
      storeStats.previousYearTotal = parseFloat(
        storeStats.previousYearTotal.toFixed(2)
      );
      storeStats.grandTotal = parseFloat(storeStats.grandTotal.toFixed(2));

      if (storeStats.previousMonthTotal > 0) {
        storeStats.monthlyIncreasePercentage = parseFloat(
          (
            ((storeStats.currentMonthTotal - storeStats.previousMonthTotal) /
              storeStats.previousMonthTotal) *
            100
          ).toFixed(2)
        );
      } else {
        storeStats.monthlyIncreasePercentage =
          storeStats.currentMonthTotal > 0 ? 100.0 : 0.0;
      }

      if (storeStats.previousYearTotal > 0) {
        storeStats.yearlyIncreasePercentage = parseFloat(
          (
            ((storeStats.currentYearTotal - storeStats.previousYearTotal) /
              storeStats.previousYearTotal) *
            100
          ).toFixed(2)
        );
      } else {
        storeStats.yearlyIncreasePercentage =
          storeStats.currentYearTotal > 0 ? 100.0 : 0.0;
      }

      if (storeStats.previousMonthCount > 0) {
        storeStats.monthlyCountIncreasePercentage = parseFloat(
          (
            ((storeStats.currentMonthCount - storeStats.previousMonthCount) /
              storeStats.previousMonthCount) *
            100
          ).toFixed(2)
        );
      } else {
        storeStats.monthlyCountIncreasePercentage =
          storeStats.currentMonthCount > 0 ? 100.0 : 0.0;
      }

      if (storeStats.previousYearCount > 0) {
        storeStats.yearlyCountIncreasePercentage = parseFloat(
          (
            ((storeStats.currentYearCount - storeStats.previousYearCount) /
              storeStats.previousYearCount) *
            100
          ).toFixed(2)
        );
      } else {
        storeStats.yearlyCountIncreasePercentage =
          storeStats.currentYearCount > 0 ? 100.0 : 0.0;
      }
    }

    res.json(statistics);
  } catch (error) {
    console.error("Error fetching seller statistics:", error.message);
    res.status(500).json({ error: "Failed to fetch seller statistics." });
  }
});

router.get("/order-data", async (req, res) => {
  try {
    const successfulOrders = await paymentCollection
      .find({ status: "success" })
      .toArray();

    const orderData = {};
    let overallTotalOrders = 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const order of successfulOrders) {
      const productDetails = await productCollection
        .find({ _id: { $in: order.productId.map((id) => new ObjectId(id)) } })
        .toArray();

      const productsWithDiscountedPrice = productDetails.map(
        (product, index) => {
          let discountedPrice;

          if (product.category === "digital gift" && product.priceGroup) {
            const matchingTier = product.priceGroup.find(
              (tier) => tier.tier === order.tier[0]
            );
            if (matchingTier) {
              discountedPrice =
                matchingTier.price.amount * (1 - product.discount / 100);
            }
          } else {
            discountedPrice = product.price * (1 - product.discount / 100);
          }

          return {
            store_name: product.store_name,
            userId: product.userId,
            price: discountedPrice
              ? parseFloat(discountedPrice.toFixed(2))
              : null,
            deliveryStatus: order.delivery[index],
            date: new Date(order.date).toISOString().split("T")[0],
          };
        }
      );

      const validProducts = productsWithDiscountedPrice.filter(
        (product) => product.deliveryStatus !== "canceled"
      );

      if (validProducts.length === 0) continue;

      validProducts.forEach((product) => {
        if (product.price) {
          const storeName = product.store_name;
          const date = new Date(product.date);

          if (date >= thirtyDaysAgo) {
            const month = `${date.getFullYear()}-${(date.getMonth() + 1)
              .toString()
              .padStart(2, "0")}`;
            const year = date.getFullYear();

            if (!orderData[storeName]) {
              orderData[storeName] = {
                totalOrders: 0,
                dailyData: {},
                monthlyData: {},
                yearlyData: {},
                totalRevenue: 0,
              };
            }

            if (!orderData[storeName].dailyData[product.date]) {
              orderData[storeName].dailyData[product.date] = {
                totalRevenue: 0,
                totalOrders: 0,
              };
            }

            orderData[storeName].dailyData[product.date].totalRevenue +=
              product.price;
            orderData[storeName].dailyData[product.date].totalOrders += 1;

            orderData[storeName].totalOrders += 1;
            overallTotalOrders += 1;

            if (!orderData[storeName].monthlyData[month]) {
              orderData[storeName].monthlyData[month] = {
                totalRevenue: 0,
                totalOrders: 0,
              };
            }

            orderData[storeName].monthlyData[month].totalRevenue +=
              product.price;
            orderData[storeName].monthlyData[month].totalOrders += 1;

            if (!orderData[storeName].yearlyData[year]) {
              orderData[storeName].yearlyData[year] = {
                totalRevenue: 0,
                totalOrders: 0,
              };
            }

            orderData[storeName].yearlyData[year].totalRevenue += product.price;
            orderData[storeName].yearlyData[year].totalOrders += 1;

            orderData[storeName].totalRevenue += product.price;
          }
        }
      });
    }

    res.json({ overallTotalOrders, orderData });
  } catch (error) {
    console.error("Error fetching order data:", error.message);
    res.status(500).json({ error: "Failed to fetch order data." });
  }
});

module.exports = router;
