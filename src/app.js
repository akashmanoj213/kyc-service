const express = require('express');
const cors = require('cors');
const verificationRoutes = require('./api/routes/verification');
const loggerMiddleware = require('./api/middlewares/loggerMiddleware');
const errorHandler = require('./api/middlewares/errorHandler');

const app = express();

//Application Middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use(loggerMiddleware);

app.get('/health', (req, res) => {
    res.status(200).send('Service running successfully...');
});

app.get('/startup', (req, res) => {
    res.status(200).send('Service started successfully!');
});

//Routes
app.use('/verification', verificationRoutes);

//Global Error handling
app.use(errorHandler);

module.exports = app;