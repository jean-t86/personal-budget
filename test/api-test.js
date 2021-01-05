const express = require('express');
const request = require('supertest');
const {assert, expect} = require('chai');

const Server = require('../server/server.js');

describe('API', function() {
  let server;
  const port = process.env.PORT || 4001;

  beforeEach(function() {
    server = new Server(express);
    Server.run(server, port);
  });

  afterEach(function(done) {
    server.close(done);
  });

  describe('', function() {

  });
});
