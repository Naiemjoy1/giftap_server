// const { Server } = require("socket.io");

// const socketConnection = (server) => {
//   const io = new Server(server, {
//     cors: {
//       origin: [
//         "http://localhost:5173",
//         "https://giftap901.web.app",
//         "https://giftap901.firebaseapp.com",
//       ],
//       credentials: true,
//     },
//   });

//   // Handle socket connections
//   io.on("connection", (socket) => {
//     console.log("A user connected: " + socket.id);

//     // Listen for messages
//     socket.on("sendMessage", (data) => {
//       console.log("Message received: ", data);
//       // Broadcast message to all connected clients
//       io.emit("receiveMessage", data);
//     });

//     // Handle disconnection
//     socket.on("disconnect", () => {
//       console.log("A user disconnected: " + socket.id);
//     });
//   });
// };

// module.exports = socketConnection;
