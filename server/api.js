const express = require('express');
const {getElementById} = require('./utils.js');
const {envelopes} = require('./data.js');
const apiRouter = new express.Router();

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

module.exports = apiRouter;
