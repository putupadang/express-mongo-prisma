const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const routes = require("./routes");
app.use("/api", routes);

app.use(errorHandler);

module.exports = app;
