const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Define email subjects as constants
const EMAIL_SUBJECTS = {
  PAYMENT_CONFIRMATION: "Payment Confirmation",
  DELIVERY_CONFIRMATION: "Delivery Confirmation",
};

const sendPaymentConfirmationEmail = async (customerEmail, paymentId) => {
  const mailOptions = {
    from: `"Giftap" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: EMAIL_SUBJECTS.PAYMENT_CONFIRMATION,
    text: `Dear Customer,\n\nYour payment with transaction ID: ${paymentId} has been successfully processed.\n\nThank you for choosing Giftap!`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      "Payment confirmation email sent successfully to:",
      customerEmail
    );
  } catch (error) {
    console.error("Error sending payment confirmation email:", error.message);
    throw error; // Rethrow to handle further up the chain if necessary
  }
};

const sendDeliveryEmail = async (
  shippingEmail,
  currentProductId,
  paymentId,
  currentMessage = ""
) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: shippingEmail,
    subject: EMAIL_SUBJECTS.DELIVERY_CONFIRMATION,
    text: `Dear Customer,\n\nYour product with ID: ${currentProductId} has been successfully delivered.\nTransaction ID: ${paymentId}${
      currentMessage ? `\n\nMessage: ${currentMessage}` : ""
    }\n\nThank you for choosing Giftap!`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Delivery email sent successfully to:", shippingEmail);
  } catch (error) {
    console.error("Error sending delivery email:", error.message);
    throw error; // Rethrow to handle further up the chain if necessary
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
