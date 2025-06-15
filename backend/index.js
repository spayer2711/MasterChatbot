const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const logger = require('./utils/logger');
const webScraper = require('./langchain/scraper');
const retriever = require('./langchain/retriever');

// Load environment variables first
dotenv.config();

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
  logger.error('OPENAI_API_KEY is not set in environment variables');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize WebScraper and Retriever
async function initializeServices() {
  try {
    logger.info('Initializing services...');
    await webScraper.initialize();
    await retriever.initialize(webScraper.vectorStore);
    logger.info('Services initialized successfully');
  } catch (error) {
    logger.error('Error initializing services:', error);
    process.exit(1);
  }
}

// Socket.IO Connection
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Handle chat messages
  socket.on('chat_message', async (message) => {
    try {
      if (!webScraper.vectorStore) {
        socket.emit('error', { message: 'Chat system is initializing. Please try again in a moment.' });
        return;
      }

      logger.info(`Processing message: ${JSON.stringify(message)}`);
      const response = await retriever.getResponse(message.content, message.chatHistory);
      
      // Log the response for debugging
      logger.info('Response from retriever:', JSON.stringify(response, null, 2));

      // Format and send response
      const formattedResponse = {
        type: 'bot',
        content: response.answer,
        sources: response.sources.map(source => ({
          content: source.content,
          source: source.metadata?.source || 'Unknown source'
        })),
        timestamp: new Date().toISOString()
      };

      // Log the formatted response
      logger.info('Sending formatted response:', JSON.stringify(formattedResponse, null, 2));
      
      socket.emit('bot_response', formattedResponse);
    } catch (error) {
      logger.error(`Error processing message: ${error.message}`);
      socket.emit('error', { message: 'Error processing your message' });
    }
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    await initializeServices();

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Error starting server:', error);
    if (error.name === 'MongooseServerSelectionError') {
      logger.info('Continuing without MongoDB...');
      // Continue server startup even if MongoDB fails
      await initializeServices();
      const PORT = process.env.PORT || 3000;
      server.listen(PORT, () => {
        logger.info(`Server running on port ${PORT} (without MongoDB)`);
      });
    } else {
      process.exit(1);
    }
  }
}

startServer();
