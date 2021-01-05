const express = require('express');
const Server = require('./server/server.js');

Server.run(new Server(express), 4001);
