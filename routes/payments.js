const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { client } = require("../config/db");
const axios = require("axios");

const paymentCollection = client.db("giftap_DB").collection("payments");
const cartsCollection = client.db("giftap_DB").collection("carts");

router.get("/", async (req, res) => {
  const result = await paymentCollection.find().toArray();
  res.send(result);
});

router.post("/", async (req, res) => {
  try {
    const paymentssl = req.body;
    const trxId = new ObjectId().toString();
    const initiateData = {
      store_id: "gifta67014d8649fb2",
      store_passwd: "gifta67014d8649fb2@ssl",
      total_amount: paymentssl.amount,
      currency: paymentssl.currency,
      tran_id: trxId,
      success_url: "http://localhost:3000/payments/success-payment",
      fail_url: "http://localhost:3000/payments/fail",
      cancel_url: "http://localhost:3000/payments/cancel",
      cus_name: paymentssl.name,
      cus_email: paymentssl.email,
      cus_add1: "Dhaka",
      cus_add2: "Dhaka",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: "01711111111",
      cus_fax: "01711111111",
      shipping_method: "NO",
      product_name: "laptop",
      product_category: "topup",
      product_profile: "general",
      multi_card_name: "mastercard,visacard,amexcard",
      value_a: "ref001_A",
      value_b: "ref002_B",
      value_c: "ref003_C",
      value_d: "ref004_D",
    };

    const response = await axios({
      method: "POST",
      url: "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
      data: new URLSearchParams(initiateData).toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (response.data.GatewayPageURL) {
      const saveData = {
        cus_name: paymentssl.name,
        cus_email: paymentssl.email,
        paymentId: trxId,
        amount: paymentssl.amount,
        status: "pending",
        date: new Date(),
        cartIds: paymentssl.cartIds,
        productId: paymentssl.productId,
      };

      await paymentCollection.insertOne(saveData);

      res.send({
        paymentUrl: response.data.GatewayPageURL,
      });
    } else {
      console.error(
        "Failed to retrieve payment URL from SSLCommerz:",
        response.data
      );
      res.status(500).send({ error: "Failed to initiate payment" });
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).send({ error: "Payment processing failed." });
  }
});

router.post("/success-payment", async (req, res) => {
  try {
    const successData = req.body;

    if (successData.status !== "VALID") {
      console.error("Invalid Payment Status: ", successData.status);
      throw new Error("Unauthorized payment, Invalid Payment");
    }

    const query = {
      paymentId: successData.tran_id,
    };

    const update = {
      $set: {
        status: "success",
      },
    };

    await paymentCollection.updateOne(query, update);

    const payment = await paymentCollection.findOne(query);
    if (payment) {
      const deleteQuery = {
        _id: { $in: payment.cartIds.map((id) => new ObjectId(id)) },
      };

      console.log("Deleting cart items for cartIds:", payment.cartIds);

      const deleteResult = await cartsCollection.deleteMany(deleteQuery);
      console.log("Deleted cart items:", deleteResult);
    }

    res.redirect("http://localhost:5173/shop");
  } catch (error) {
    console.error("Error on payment success:", error.message);
    res.status(500).send({ error: "Payment confirmation failed." });
  }
});

router.post("/fail", async (req, res) => {
  res.redirect("http://localhost:5173/shop");
});

router.post("/cancel", async (req, res) => {
  res.redirect("http://localhost:5173/shop");
});

module.exports = router;
