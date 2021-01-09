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
            expect(envelope).to.have.ownProperty('balance');
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

  describe('GET all envelopes', function() {
    it('returns status code 200', function(done) {
      request(server.expressApp)
          .get('/api/envelopes')
          .expect(200, done);
    });

    it('returns an array with status 200', function() {
      return request(server.expressApp)
          .get('/api/envelopes')
          .expect(200)
          .then((res) => {
            const envelopes = res.body;
            expect(envelopes).to.be.an.instanceOf(Array);
          });
    });

    it('returns an array of well formed envelope objects', function() {
      return request(server.expressApp)
          .get('/api/envelopes')
          .expect(200)
          .then((res) => {
            const envelopes = res.body;
            envelopes.forEach((envelope) => {
              expect(envelope).to.have.ownProperty('id');
              expect(envelope).to.have.ownProperty('category');
              expect(envelope).to.have.ownProperty('balance');
            });
          });
    });
  });

  describe('POST new envelope', function() {
    const validEnvelope = {
      category: 'New category',
      balance: 125,
    };

    const invalidEnvelope = {
      category: '',
      balance: null,
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
      assert.ok(newId);
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

  describe('POST to substract from balance on an envelope', function() {
    it('returns status code 200', function(done) {
      request(server.expressApp)
          .post('/api/envelopes/4/withdraw/50')
          .expect(200, done);
    });

    it('returns status code 404 if id is not found', function(done) {
      request(server.expressApp)
          .post('/api/envelopes/48/withdraw/50')
          .expect(404, done);
    });

    it('returns 400 if the id is not numeric', function(done) {
      request(server.expressApp)
          .post('/api/envelopes/fsdf/withdraw/50')
          .expect(400, done);
    });

    it('updates and return balance on withdraw', async function() {
      let initBalance;
      await request(server.expressApp)
          .get('/api/envelopes/3')
          .expect(200)
          .then((res) => {
            initBalance = res.body.balance;
            assert.ok(initBalance);
          });

      await request(server.expressApp)
          .post('/api/envelopes/3/withdraw/50')
          .expect(200);

      let updatedBalance;
      await request(server.expressApp)
          .get('/api/envelopes/3')
          .expect(200)
          .then((res) => {
            updatedBalance = res.body.balance;
            assert.ok(updatedBalance);
            assert.ok(initBalance > updatedBalance);
          });
    });

    it('returns 400 and balance if cannot withdraw', function() {
      const withdraw = 400;
      return request(server.expressApp)
          .post(`/api/envelopes/5/withdraw/${withdraw}`)
          .expect(400)
          .then((res) => {
            const balance = res.body.balance;
            assert.ok(balance < withdraw);
          });
    });

    it('returns 400 if withdraw is not a number', function() {
      return request(server.expressApp)
          .post('/api/envelopes/5/withdraw/df')
          .expect(400);
    });

    it('returns 400 if withdraw is missing', function() {
      return request(server.expressApp)
          .post('/api/envelopes/5/withdraw/500')
          .expect(400);
    });
  });

  describe('DELETE an envelope', function() {
    it('returns status code 204', function(done) {
      request(server.expressApp)
          .delete('/api/envelopes/5')
          .expect(204, done);
    });

    it('returns status 204 and deletes an envelope', async function() {
      await request(server.expressApp)
          .delete('/api/envelopes/7')
          .expect(204);

      await request(server.expressApp)
          .get('/api/envelopes/7')
          .expect(404);
    });

    it('returns 404 if the envelope does not exist', function(done) {
      request(server.expressApp)
          .delete('/api/envelopes/73')
          .expect(404, done);
    });
  });
});
