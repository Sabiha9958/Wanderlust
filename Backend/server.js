require("dotenv").config();
const connectDB = require("./src/config/db");
const http = require("http");
const app = require("./src/app");
const { initSocket } = require("./src/socket/socket");

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

// ✅ initialize socket with server
initSocket(server);

(async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
})();
