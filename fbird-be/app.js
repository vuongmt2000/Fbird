const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Server } = require("socket.io");
const { errorHandler } = require('./src/Utils/ResponseHandler');
require("dotenv").config();

const app = express();

//cors
const cors = require('cors')
app.use(cors())

// Setup server port
const port = process.env.PORT || 8001;

var dir = path.join(__dirname, '/public');

app.use(express.static(dir));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// Configuring the database
require("./src/db/index")

// Listen contract
require("./src/Contracts/index")

// define a root/default route
app.get('/', (req, res) => {
    res.json({ "message": "Test" });
});

// Require Users routes
const routes = require("./src/Routes");
app.use("/v1/api", routes);
app.use((err, req, res, next) => {
    errorHandler(err, res);
});

const server = require('http').createServer(app)
const io = new Server(server);
require('./src/Utils/socket')(io)

server.listen(port, () => {
    console.log(`Node server is listening on port ${port}`);
});