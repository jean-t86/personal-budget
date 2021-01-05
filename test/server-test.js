const {assert} = require('chai');
const sinon = require('sinon');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const apiRouter = require('../server/api.js');
const Server = require('../server/server.js');

describe('Server', function() {
  let server;

  beforeEach(function() {
    server = new Server(express);
  });

  afterEach(function() {
    sinon.restore();
  });

  describe('Express app initialization', function() {
    it('Initializes app in constructor by calling express()', function() {
      const spyExpress = sinon.spy(express);

      server = new Server(spyExpress);

      assert.ok(spyExpress.calledOnce);
      assert.ok(server.expressApp !== undefined);
    });
  });

  describe('Set up body-parser.json middleware', function() {
    it('app.use is called when server.setupBodyParser is called', function() {
      const mockApp = sinon.mock(server.expressApp);
      mockApp.expects('use').once();

      server.setupBodyParser(bodyParser.json);

      mockApp.verify();
    });

    it('body-parser.json() is called inside app.use', function() {
      const spyBodyParser = sinon.spy(bodyParser.json);

      server.setupBodyParser(spyBodyParser);

      assert.ok(spyBodyParser.calledOnce);
    });
  });

  describe('Set up cors middleware', function() {
    it('app.use is called when server.setupCors is called', function() {
      const mockApp = sinon.mock(server.expressApp);
      mockApp.expects('use').once();

      server.setupCors(cors);

      mockApp.verify();
    });

    it('cors function is called when server.setupCors is called', function() {
      const spyCors = sinon.spy(cors);

      server.setupCors(spyCors);

      assert.ok(spyCors.calledOnce);
    });
  });

  describe('Set up morgan middleware', function() {
    it('app.use is called when server.setupMorgan is called', function() {
      const mockApp = sinon.mock(server.expressApp);
      mockApp.expects('use').once();

      server.setupMorgan(morgan, 'combined');

      mockApp.verify();
    });

    it('morgan is called with format combined', function() {
      const spyMorgan = sinon.spy(morgan);
      const format = 'combined';
      server.setupMorgan(spyMorgan, format);

      assert.ok(spyMorgan.calledOnce);
      assert.strictEqual(spyMorgan.getCall(0).args[0], format);
    });
  });

  describe('Mount API router', function() {
    it('app.use is called when server.mountApiRouter is called', function() {
      const mockApp = sinon.mock(server.expressApp);
      mockApp.expects('use').once();

      server.mountRouter('', null);

      mockApp.verify();
    });

    it('app.use is called with the route and apiRouter', function() {
      const spyApp = sinon.spy(server.expressApp, 'use');
      const route = '/api';
      server.mountRouter(route, apiRouter);

      assert.ok(spyApp.calledOnce);
      assert.strictEqual(spyApp.getCall(0).args[0], route);
      assert.strictEqual(spyApp.getCall(0).args[1], apiRouter);
    });
  });

  describe('Listens for incoming requests', function() {
    it('app.listen is called when server.listen called', function() {
      const mockApp = sinon.mock(server.expressApp);
      mockApp.expects('listen').once();

      server.listen();

      mockApp.verify();
    });

    it('server.listen returns an http.Server object', function(done) {
      const httpServer = server.listen();

      assert.ok(httpServer !== undefined);
      httpServer.close(done);
    });

    it('server listens to port when server.listen is called', function(done) {
      const port = 4002;
      const spyApp = sinon.spy(server.expressApp, 'listen');
      const httpServer = server.listen(port);

      assert.ok(spyApp.calledOnce);
      assert.strictEqual(spyApp.getCall(0).args[0]. port);
      httpServer.close(done);
    });

    it('logs a message when the server starts to listen', function(done) {
      const spyConsole = sinon.spy(console, 'log');
      const port = 4003;
      const msg = `Server is listening on port: ${port}`;

      const httpServer = server.listen(port, msg);

      httpServer.on('listening', () => {
        assert.ok(spyConsole.calledOnce);
        assert.strictEqual(spyConsole.getCall(0).args[0], msg);
        httpServer.close(done);
      });
    });
  });

  describe('Closes the http.Server connection', function(done) {
    it('httpServer.close is called when Server.close is called', function() {
      const httpServer = server.listen(4001);
      const spyHttpServer = sinon.spy(server.httpServer, 'close');

      httpServer.on('listening', () => {
        server.close(done);
        assert.ok(spyHttpServer.calledOnce);
      });
    });

    it('server.close returns true if server is listening', function(done) {
      const httpServer =server.listen(4001);

      httpServer.on('listening', () => {
        assert.ok(server.close(done));
      });
    });

    it('server.close returns false if server is not listening', function(done) {
      assert.ok(!server.close(done));
    });
  });

  describe('Runs the server', function() {
    it('calls all methods necessary to run the server', function(done) {
      const spyBodyParser = sinon.spy(server, 'setupBodyParser');
      const spyCors = sinon.spy(server, 'setupCors');
      const spyMorgan = sinon.spy(server, 'setupMorgan');
      const spyMountApiRouter = sinon.spy(server, 'mountRouter');
      const spyListen = sinon.spy(server, 'listen');

      Server.run(server, 4001);

      server.httpServer.on('listening', ()=> {
        assert.ok(spyBodyParser.calledOnce);
        assert.strictEqual(spyBodyParser.getCall(0).args[0], bodyParser.json);

        assert.ok(spyCors.calledAfter(spyBodyParser));
        assert.strictEqual(spyCors.getCall(0).args[0], cors);

        assert.ok(spyMorgan.calledAfter(spyCors));
        assert.strictEqual(spyMorgan.getCall(0).args[0], morgan);
        assert.strictEqual(spyMorgan.getCall(0).args[1], 'combined');

        assert.ok(spyMountApiRouter.calledAfter(spyMorgan));
        assert.strictEqual(spyMountApiRouter.getCall(0).args[0], '/api');
        assert.strictEqual(spyMountApiRouter.getCall(0).args[1], apiRouter);

        assert.ok(spyListen.calledAfter(spyMountApiRouter));
        assert.strictEqual(spyListen.getCall(0).args[0], 4001);

        server.close(done);
      });
    });
  });
});
