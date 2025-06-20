const { createServer } = require("node:http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  // Initialize Socket.IO server
  const io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  console.log("🚀 Socket.IO server initializing...");

  // Socket.IO connection handling
  io.on("connection", (socket) => {
    const clientId = socket.id;
    console.log(`👤 Client connected: ${clientId}`);

    // Handle room joining
    socket.on("join-room", (data) => {
      const { roomCode, user } = data;
      console.log(`🏠 User ${user.email} joining room: ${roomCode}`);

      socket.join(roomCode);
      socket.currentRoom = roomCode;
      socket.userInfo = user;

      // Notify others in the room
      socket.to(roomCode).emit("user-joined", {
        userId: user.id,
        userName: user.user_metadata?.full_name || user.email,
        timestamp: new Date().toISOString(),
      });

      // Send current room users to the new user
      const roomUsers = Array.from(io.sockets.adapter.rooms.get(roomCode) || [])
        .map((socketId) => {
          const userSocket = io.sockets.sockets.get(socketId);
          return userSocket?.userInfo
            ? {
                userId: userSocket.userInfo.id,
                userName:
                  userSocket.userInfo.user_metadata?.full_name ||
                  userSocket.userInfo.email,
                socketId: userSocket.id,
              }
            : null;
        })
        .filter(Boolean);

      socket.emit("room-users", roomUsers);
    });

    // Handle page synchronization
    socket.on("page-change", (data) => {
      const { roomCode, pageNumber, userId } = data;
      console.log(`📄 Page change in ${roomCode}: ${pageNumber} by ${userId}`);

      socket.to(roomCode).emit("page-changed", {
        pageNumber,
        userId,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle cursor position sharing
    socket.on("cursor-move", (data) => {
      const { roomCode, position, userId } = data;

      socket.to(roomCode).emit("cursor-moved", {
        position,
        userId,
        socketId: socket.id,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle comments in real-time
    socket.on("comment-added", (data) => {
      const { roomCode, comment } = data;
      console.log(`💬 New comment in ${roomCode}`);

      socket.to(roomCode).emit("comment-received", {
        comment,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      console.log(`👋 Client disconnected: ${clientId} - ${reason}`);

      if (socket.currentRoom && socket.userInfo) {
        socket.to(socket.currentRoom).emit("user-left", {
          userId: socket.userInfo.id,
          userName:
            socket.userInfo.user_metadata?.full_name || socket.userInfo.email,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error(`🚨 Socket error for ${clientId}:`, error);
    });
  });

  // Start the server
  httpServer
    .once("error", (err) => {
      console.error("🚨 Server error:", err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`🔌 Socket.IO server running on port ${port}`);
    });
});
