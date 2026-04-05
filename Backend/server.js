require("dotenv").config();
const connectDB = require("./src/config/db");
const app = require("./src/app");

const PORT = process.env.PORT || 8080;

// Connect to DB and start server
(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
})();
