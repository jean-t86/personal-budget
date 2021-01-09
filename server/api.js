const express = require('express');
const {getElementById, getNewId, getIndexById} = require('./utils.js');
const {envelopes} = require('./data.js');
const apiRouter = new express.Router();

apiRouter.get('/envelopes', (req, res) => {
  res.status(200).send(envelopes);
});

apiRouter.param('id', (req, res, next) => {
  const id = Number(req.params.id);
  if (id) {
    const envelope = getElementById(envelopes, id);
    if (envelope) {
      req.body.envelope = envelope;
      next();
    } else {
      res.status(404).send();
    }
  } else {
    res.status(400).send();
  }
});

apiRouter.get('/envelopes/:id', (req, res) => {
  res.status(200).send(req.body.envelope);
});

const validateEnvelope = (req, res, next) => {
  const envelope = req.body;
  if (envelope.category && envelope.balance) {
    req.envelope = envelope;
    next();
  } else {
    res.status(400).send();
  }
};

apiRouter.post('/envelopes', validateEnvelope, (req, res) => {
  const envelope = req.envelope;
  envelope.id = getNewId(envelopes);
  envelopes.push(envelope);
  res.status(201).send(envelope);
});

apiRouter.param('amount', (req, res, next) => {
  const withdraw = Number(req.params.amount);
  const envelope = req.body.envelope;
  if (withdraw < envelope.balance) {
    envelope.balance -= withdraw;
    req.body.amount = withdraw;
    req.body.envelope = envelope;
    next();
  } else {
    res.status(400).send(envelope);
  }
});

apiRouter.post('/envelopes/:id/withdraw/:amount', (req, res) => {
  res.status(200).send(req.body.envelope);
});

apiRouter.delete('/envelopes/:id', (req, res) => {
  const index = getIndexById(envelopes, req.body.envelope.id);
  envelopes.splice(index, 1);
  res.status(204).send();
});

apiRouter.param('to', (req, res, next) => {
  const to = Number(req.params.to);
  if (to) {
    const toEnvelope = getElementById(envelopes, to);
    if (toEnvelope) {
      req.body.toEnvelope = toEnvelope;
      next();
    } else {
      res.status(404).send();
    }
  } else {
    res.status(400).send();
  }
});

apiRouter.post('/envelopes/:id/:to/:amount', (req, res) => {
  const toEnvelope = req.body.toEnvelope;
  const amount = req.body.amount;
  toEnvelope.balance += amount;
  res.status(200).send();
});

module.exports = apiRouter;
