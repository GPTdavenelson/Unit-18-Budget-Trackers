const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");

const PORT = process.env.PORT || '3000';

const app = express();

app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));
mongoose.connect('mongodb://localhost:27017/budget', {
  connectTimeoutMS: 1000,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// routes
app.use(require("./routes/api.js"));

app.listen(PORT, () => console.log(`Running on localhost:${PORT}`));
