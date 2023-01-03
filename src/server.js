const http = require('http');
const express = require('express');
const cors = require('cors');

//load environment variables from .env
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ override: "true" });
}

// const app = require('./app');

// const port = parseInt(process.env.PORT) || 8080;

// const server = http.createServer(app);

// server.listen(port, () => console.log(`App listening on port: ${port}...`));

async function startServer() {
    const { setMiddleWare } = require('./app')
    const app = await setMiddleWare();
    const port = parseInt(process.env.PORT) || 8080;
    const server = http.createServer(app);
    server.listen(port, () => console.log(`App listening on port: ${port}...`));
}

startServer();