
const express = require('express');
const cors = require('cors');
const verificationRoutes = require('./api/routes/verification');
const traceLogger = require('./api/middlewares/traceLogger');
const errorHandler = require('./api/middlewares/errorHandler');

const app = express();

//Application Middlewares
app.use(traceLogger);

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(200).send('Api is working properly!');
});

//Routes
app.use('/verification', verificationRoutes);

//Global Error handling
app.use(errorHandler);

module.exports = app;