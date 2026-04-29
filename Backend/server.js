require("dotenv").config();

const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/db");
const { initSocket } = require("./src/socket/socket");

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    // DB Connection
    await connectDB();

    // HTTP Server
    const server = http.createServer(app);

    // Socket init
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
    });

    /* Graceful shutdown */
    process.on("SIGINT", () => {
      console.log("🛑 Server shutting down...");
      server.close(() => {
        process.exit(0);
      });
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
