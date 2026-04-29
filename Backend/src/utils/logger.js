const morgan = require("morgan");

const isDev = process.env.NODE_ENV === "development";

const logger = morgan(
  isDev
    ? "dev"
    : ":remote-addr - :method :url :status :res[content-length] - :response-time ms",
  {
    skip: (req, res) => !isDev && res.statusCode < 400,
  },
);

module.exports = logger;
