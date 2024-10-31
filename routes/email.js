const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const { ObjectId } = require("mongodb");
const { client } = require("../config/db");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const EMAIL_SUBJECTS = {
  PAYMENT_CONFIRMATION: "Payment Confirmation",
  DELIVERY_CONFIRMATION: "Delivery Confirmation",
};

const sendPaymentConfirmationEmail = async (
  customerEmail,
  paymentId,
  productIds,
  quantities
) => {
  const productCollection = client.db("giftap_DB").collection("products");

  const products = await productCollection
    .find({
      _id: { $in: productIds.map((id) => new ObjectId(id)) },
    })
    .toArray();

  const productRows = products
    .map(
      (product, index) => `
    <tr>
      <td style="text-align: center;">${index + 1}</td>
      <td style="text-align: center;"><img src="${
        product.image.cardImg1
      }" alt="${
        product.name
      }" style="width: 50px; height: auto; border-radius: 8px;"></td>
      <td style="text-align: center;">${product.name}</td>
      <td style="text-align: center;">${product.category}</td>
      <td style="text-align: center;">${quantities[index]}</td>
    </tr>
  `
    )
    .join("");

  const mailOptions = {
    from: `"Giftap" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: EMAIL_SUBJECTS.PAYMENT_CONFIRMATION,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="text-align: center; color: #4CAF50;">🎉 Payment Confirmation 🎉</h2>
        <p>Dear Customer,</p>
        <p>We’re excited to inform you that your payment has been successfully processed!</p>
        <div style="background-color: #f2f2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Transaction ID:</strong> ${paymentId}</p>
        </div>
        <h3 style="text-align: center;">Ordered Products</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Index</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Product Image</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Product Name</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Category</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Quantity</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>
        <p>Thank you for choosing <strong>Giftap</strong>. We look forward to serving you again!</p>
        <p style="margin-top: 30px; color: #888;">Best Regards,<br>Giftap Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      "Payment confirmation email sent successfully to:",
      customerEmail
    );
  } catch (error) {
    console.error("Error sending payment confirmation email:", error.message);
    throw error;
  }
};

const sendDeliveryEmail = async (
  shippingEmail,
  currentProductId,
  paymentId,
  currentMessage = ""
) => {
  try {
    const productCollection = client.db("giftap_DB").collection("products");
    const product = await productCollection.findOne({
      _id: new ObjectId(currentProductId),
    });

    if (!product) {
      throw new Error("Product not found");
    }

    const { image, name, store_name, sku } = product;

    const mailOptions = {
      from: `"Giftap" <${process.env.EMAIL_USER}>`,
      to: shippingEmail,
      subject: EMAIL_SUBJECTS.DELIVERY_CONFIRMATION,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2 style="text-align: center; color: #4CAF50;">📦 Delivery Confirmation 📦</h2>
          <p>Dear Customer,</p>
          <p>We’re delighted to let you know that your product has been successfully delivered!</p>
          <div style="display: flex; align-items: flex-start; background-color: #f2f2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <div style="flex: 1; padding-right: 20px;">
              <img src="${
                image.cardImg1
              }" alt="Product Image" style="width: 100%; max-width: 200px; border-radius: 8px;">
            </div>
            <div style="flex: 2;">
              <p style="margin: 0;"><strong>Product:</strong> ${name}</p>
              <p style="margin: 0;"><strong>Store Name:</strong> ${store_name}</p>
              <p style="margin: 0;"><strong>SKU:</strong> ${sku}</p>
              <p style="margin: 0;"><strong>Transaction ID:</strong> ${paymentId}</p>
              ${
                currentMessage
                  ? `<p style="margin: 0;"><strong>Message:</strong> ${currentMessage}</p>`
                  : ""
              }
            </div>
          </div>
          <p>Thank you for trusting <strong>Giftap</strong> with your purchase. Enjoy your gift!</p>
          <p style="margin-top: 30px; color: #888;">Warm regards,<br>Giftap Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Delivery email sent successfully to:", shippingEmail);
  } catch (error) {
    console.error("Error sending delivery email:", error.message);
    throw error;
  }
};

router.post("/send-confirmation", async (req, res) => {
  const { customerEmail, paymentId } = req.body;

  try {
    await sendPaymentConfirmationEmail(customerEmail, paymentId);
    res.status(200).send({ message: "Email sent successfully." });
  } catch (error) {
    res.status(500).send({ error: "Failed to send email." });
  }
});

module.exports = router;
module.exports.sendPaymentConfirmationEmail = sendPaymentConfirmationEmail;
module.exports.sendDeliveryEmail = sendDeliveryEmail;
