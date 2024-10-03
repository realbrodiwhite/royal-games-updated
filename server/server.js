// File path: /royalgames-main/server/Server.js

const express = require('express');
const rateLimit = require('express-rate-limit');

class Server {
  constructor() {
    // Set the port, using the environment variable if available, otherwise default to 3001
    const port = process.env.PORT || 3001;

    // Initialize Express application
    const app = express();

    // Set up rate limiter: maximum of 100 requests per 15 minutes
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    });

    // Apply rate limiter to all requests
    app.use(limiter);

    // Create HTTP server using the Express app
    const http = require('http');
    const server = http.createServer(app);

    // Set up Socket.IO with CORS configuration
    const SocketIo = require("socket.io");
    const io = new SocketIo.Server(server, {
      cors: {
        origin: "https://royalgames-client.replit.app", // Allow connections from this origin
      },
    });

    // Serve static files from the 'public' directory
    app.use(express.static(__dirname + '/public'));

    // Route for the root path
    app.get('/', (req, res) => {
      res.sendFile(__dirname + 'server/public/index.html');
    });

    // Catch-all route to serve index.html for any unmatched routes (for SPA support)
    app.use((req, res) => {
      res.sendFile(__dirname + 'server/public/index.html');
    });

    // Handle new Socket.IO connections
    io.on('connection', (socket) => {
      console.log('a user connected');
    });

    // Store important objects as properties of the class instance
    this.app = app;
    this.server = server;
    this.io = io;
    this.port = port;
  }

  // Method to start the server
  start() {
    // Start listening on the specified port
    this.server.listen(this.port, () => {
      console.log(`App listening on port ${this.port}`)
    });

    // Return the Socket.IO instance
    return this.io;
  }
}

module.exports = Server;
