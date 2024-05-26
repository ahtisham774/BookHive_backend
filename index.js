const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
app.use(cors({}));
// origin: "http://localhost:3000",
const port = process.env.PORT;
const bodyParser = require("body-parser");

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("uploads"));
app.use("/user", require("./routes/user"));
app.use("/admin", require("./routes/admin"));

mongoose.connect(process.env.DATABASE);
app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
