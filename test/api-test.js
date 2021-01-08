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

  describe('POST new envelope', function() {
    const validEnvelope = {
      category: 'New category',
      limit: 125,
    };

    const invalidEnvelope = {
      category: '',
      limit: null,
    };

    it('returns 201', function(done) {
      request(server.expressApp)
          .post('/api/envelopes')
          .send(validEnvelope)
          .expect(201, done);
    });

    it('adds new object if valid', async function() {
      const postRes = await request(server.expressApp)
          .post('/api/envelopes')
          .send(validEnvelope)
          .expect(201);
      const postEnvelope = postRes.body;
      const newId = postEnvelope.id;

      const getRes = await request(server.expressApp)
          .get(`/api/envelopes/${newId}`)
          .expect(200);
      const getEnvelope = getRes.body;

      assert.deepEqual(getEnvelope.id, newId);
      assert.notEqual(newId, undefined);
    });

    it('returns 400 if post an invalid envelope', function(done) {
      request(server.expressApp)
          .post('/api/envelopes')
          .send(invalidEnvelope)
          .expect(400, done);
    });


    it('returns 400 if post without an envelope', function(done) {
      request(server.expressApp)
          .post('/api/envelopes')
          .expect(400, done);
    });
  });
}); ;
