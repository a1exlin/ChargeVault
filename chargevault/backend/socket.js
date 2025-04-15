require("dotenv").config();

let io;

module.exports = {
  init: (server) => {
    const { Server } = require("socket.io");
    io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN,
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", async (socket) => {
      console.log("Client connected:", socket.id);
      const Slot = require("./models/slot");
      try {
        const allSlots = await Slot.find().sort({ id: 1 });
        socket.emit("init", allSlots);
      } catch (err) {
        console.error("Socket init error:", err);
      }
    });

    return io;
  },
  getIO: () => {
    if (!io) throw new Error("Socket.io not initialized");
    return io;
  },
};
