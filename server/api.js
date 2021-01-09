const express = require('express');
const {getElementById, getNewId} = require('./utils.js');
const {envelopes} = require('./data.js');
const apiRouter = new express.Router();

apiRouter.get('/envelopes', (req, res) => {
  res.status(200).send(envelopes);
});

apiRouter.get('/envelopes/:id', (req, res) => {
  const id = Number(req.params.id);
  if (id) {
    const envelope = getElementById(envelopes, id);
    if (envelope) {
      res.status(200).send(envelope);
    } else {
      res.status(404).send();
    }
  } else {
    res.status(400).send();
  }
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

apiRouter.post('/envelopes/:id/withdraw/:amount', (req, res) => {
  const id = Number(req.params.id);
  if (id) {
    const envelope = getElementById(envelopes, id);
    if (envelope) {
      const withdraw = Number(req.params.amount);
      if (withdraw < envelope.balance) {
        const balance = envelope.balance - withdraw;
        envelope.balance = balance;
        res.status(200).send(envelope);
      } else {
        res.status(400).send(envelope);
      }
    } else {
      res.status(404).send();
    }
  } else {
    res.status(400).send();
  }
});

module.exports = apiRouter;
