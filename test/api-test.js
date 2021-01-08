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

  describe('GET envelope', function() {
    it('returns 200', function(done) {
      request(server.expressApp)
          .get('/api/envelopes/1')
          .expect(200, done);
    });

    it('returns a single object', function() {
      return request(server.expressApp)
          .get('/api/envelopes/1')
          .expect(200)
          .then((res) => {
            const envelope = res.body;
            expect(envelope).to.be.an.instanceOf(Object);
            expect(envelope).not.to.be.an.instanceOf(Array);
          });
    });

    it('returns a full envelope object', function() {
      return request(server.expressApp)
          .get('/api/envelopes/1')
          .expect(200)
          .then((res) => {
            const envelope = res.body;
            expect(envelope).to.have.ownProperty('id');
            expect(envelope).to.have.ownProperty('category');
            expect(envelope).to.have.ownProperty('limit');
          });
    });

    it('returned envelope has the correct id', function() {
      const id = 2;
      return request(server.expressApp)
          .get(`/api/envelopes/${id}`)
          .expect(200)
          .then((res) => {
            const envelope = res.body;
            assert.equal(envelope.id, id);
          });
    });

    it('called with non-numeric id returns 400 error', function(done) {
      const id = 'hello';
      request(server.expressApp)
          .get(`/api/envelopes/${id}`)
          .expect(400, done);
    });

    it('called with an invalid id returns 404 error', function(done) {
      const id = 90;
      request(server.expressApp)
          .get(`/api/envelopes/${id}`)
          .expect(404, done);
    });
  });
}); ;
