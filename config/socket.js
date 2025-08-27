let ioInstance = null;

function initSocket(server) {
  const { Server } = require("socket.io");
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 New client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });

  ioInstance = io;
}

function getIo() {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized yet!");
  }
  return ioInstance;
}

module.exports = { initSocket, getIo };
