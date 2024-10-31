# Giftap

![Giftap Logo](https://i.ibb.co.com/hVhqGPK/fs-giftap-abbb0867-4a79-4079-9ac7-5b6593b16168-512x512.webp)

**Live Link:** [Giftap Live](https://giftap901.web.app/)

## Project Overview

Giftap is an e-commerce platform designed to streamline the purchase and delivery of digital and physical gifts. Our platform enhances the gifting experience with personalized options, scheduling capabilities, real-time tracking, and a variety of digital gift cards. Giftap caters to individuals and businesses seeking convenient and flexible gifting solutions.

## Features

- **Gift Personalization:** Users can add personalized messages for digital gifts, and receivers will receive an email with the message upon delivery.
- **Gift Scheduling:** Users can schedule delivery for digital gifts on special occasions and include messages.
- **Real-time Delivery Tracking:** Users receive a payment confirmation email with a transaction ID to track order status in real-time and can cancel orders if logged in.
- **Digital Gift Cards:** Purchase and instantly receive digital gift cards (e.g., Netflix, Spotify, Amazon) via email, with scheduling options available.
- **Multi-User System:** The platform supports Regular Users, Sellers, and Administrators, with a seller application system.
- **Seller Comparison:** Users can compare similar products from different sellers based on the current product.
- **Recent Views:** A feature that stores recently visited products, excluding duplicates.
- **Chat with Seller via Socket.io:** Users can chat with sellers about products through a chat button on the product details page.
- **Notifications:** Users receive notifications for chat initiations and other relevant updates.
- **Gift Subscriptions & Occasion-Based Offers:** Users can view upcoming offers on a calendar in their dashboard.

## Technology Stack

- **Frontend:** React.js
- **Backend:** Node.js
- **Database:** MongoDB
- **Real-time Communication:** Socket.io
- **Email Service:** SendGrid or AWS SES
- **Authentication:** JSON Web Tokens (JWT)

## Getting Started

### Prerequisites

- Node.js (version >= 14.x)
- MongoDB (local installation or cloud instance)
- NPM or Yarn (for package management)

### Installation

1. **Clone the repositories:**

   ```bash
   git clone https://github.com/Naiemjoy1/giftap_client.git
   git clone https://github.com/Naiemjoy1/giftap_server.git
   ```

2. **Set up the Backend:**

   - Navigate to the backend directory:
     ```bash
     cd giftap_server
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file and set your environment variables (refer to `.env.example`).
   - Start the server:

     ```bash
     npm start
     ```

     3. **Set up the Frontend:**

   - Navigate to the frontend directory:
     ```bash
     cd giftap_client
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the React app:
     ```bash
     npm start
     ``
     ```

## Deployment

### Frontend

Deploy the frontend using platforms like Vercel, Netlify, or AWS S3.

### Backend

Deploy the backend using platforms like Heroku, DigitalOcean, or AWS EC2.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.

2. Create a new branch:
   ```bash
   git checkout -b feature/new-feature
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Add new feature"
   ```
4. Push to your forked repository:
   ```bash
   git push origin feature/new-feature
   ```
5. Open a Pull Request.
