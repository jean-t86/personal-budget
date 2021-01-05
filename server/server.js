const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const apiRouter = require('./api');

/**
 * The Server class used to wrap around and configure an http.server created
 * when an Express application starts listening for incoming requests.
 */
class Server {
  /**
   * The Server class constructor
   * @param {core.Express} express The function to create an express
   * application
   */
  constructor(express) {
    this._expressApp = express();
  }

  /**
   * Returns the Express application
   */
  get expressApp() {
    return this._expressApp;
  }

  /**
   * Returns the httpServer
   */
  get httpServer() {
    return this._httpServer;
  }

  /**
   * Sets the body parser for the server.
   * @param {Middleware} bodyParser Middleware that only parses a
   * specific Content-Type and only looks at requests where the header
   * matches the type otion.
   */
  setupBodyParser(bodyParser) {
    this._expressApp.use(bodyParser());
  }

  /**
   * Sets the CORS policy on the server.
   * @param {Middleware} cors Middleware that sets the Cross-origin
   * Resource Sharing policy on the server.
   */
  setupCors(cors) {
    this._expressApp.use(cors());
  }

  /**
   * Sets the morgan logger for the server.
   * @param {Middleware} morgan Middleware that logs every requests
   * received to the console.
   * @param {string} format The format of the message that gets logged.
   */
  setupMorgan(morgan, format) {
    this._expressApp.use(morgan(format));
  }

  /**
   * Mounts a router on the route provided.
   * @param {string} route The route on which to mount the router.
   * @param {Middleware} router A router for the API.
   */
  mountRouter(route, router) {
    this._expressApp.use(route, router);
  }

  /**
   * Starts listening for incoming requests.
   * @param {number} port The port number on which the server listent to
   * incoming requests.
   * @param {string} msg The message to log to the console when the server
   * starts to listen for incoming requests.
   * @return {http.Server} An http.Server object
   */
  listen(port, msg) {
    this._httpServer = this._expressApp.listen(port, () => {
      console.log(msg);
    });
    return this._httpServer;
  }

  /**
   *  Closes the http.Server connection
   * @param {callback} done A callback that marks the end of an asynchronous
   * method call. This is necessary for correct unit testing behavior.
   * @return {boolean} True is there was a connection to close, false otherwise.
   */
  close(done) {
    if (this._httpServer) {
      this._httpServer.close(done);
      return true;
    } else {
      done();
      return false;
    }
  }

  /**
   * Runs the server with the correct configuration
   * @param {Server} server An instance of the Server class
   * @param {number} port The port on which to listen for incoming requests
   */
  static run(server, port) {
    server.setupBodyParser(bodyParser.json);
    server.setupCors(cors);
    server.setupMorgan(morgan, 'combined');
    server.mountRouter('/api', apiRouter);
    server.listen(port, `Server is listening on port: ${port}`);
  }
}

module.exports = Server;
