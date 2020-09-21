const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const compression = require('compression');
require('dotenv').config();

const PORT = process.env.PORT || '3000';
const ENV = process.env.NODE_ENV || 'development';

const MONGO_URI =
    process.env.NODE_ENV === 'production'
        ? `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@unit-17-workout-tracker.4760h.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
        : 'mongodb://localhost:27017/transactions';

console.log(MONGO_URI);

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    autoIndex: false, // Don't build indexes
    poolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};
const app = express();

app.use(logger('dev'));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));
mongoose.connect(MONGO_URI, options);

// routes
app.use(require('./routes/api.js'));

app.listen(PORT, () => console.log(`Running in ${ENV} on localhost:${PORT}`));
