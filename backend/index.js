const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('./utils/logger');
const webScraper = require('./langchain/scraper');
const retriever = require('./langchain/retriever');
const { handleUrlActions } = require('./controllers/urlController');
const { handleConversation } = require('./controllers/conversationController');
const { initializeServices } = require('./utils/initService');
const connectToMongo = require('./utils/db')

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

// routes for api integration
app.post('/api/urls', handleUrlActions);
app.post('/api/conversation', handleConversation);


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
            const db = await connectToMongo();
            const messagesCollection = db.collection('messages');
            const sessionId = message.sessionId || socket.id;

            // 1️⃣ Save User Message
            const userMsg = {
                sessionId,
                type: 'user',
                content: message.content,
                timestamp: new Date().toISOString()
            };
            await messagesCollection.insertOne(userMsg);

            const response = await retriever.getResponse(message.content, message.chatHistory);

            // Log the response for debugging
            logger.info('Response from retriever:', JSON.stringify(response, null, 2));

            // Format and send response
            const formattedResponse = {
                sessionId,
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
            await messagesCollection.insertOne(formattedResponse);
            logger.info('User and Bot messages saved to MongoDB');
        } catch (error) {
            logger.error(`Error processing message: ${error.message}`);
            socket.emit('error', { message: 'Error processing your message' });
        }
    });

    socket.on('get_chat_history', async (sessionId) => {
        try {
            if (!sessionId) {
                socket.emit('error', { message: 'Session ID is required to fetch chat history' });
                return;
            }

            const db = await connectToMongo();
            const messagesCollection = db.collection('messages');

            const messages = await messagesCollection
                .find({ sessionId })
                .sort({ timestamp: 1 }) // oldest to newest
                .toArray();

            // Optionally clean or enrich messages
            const formatted = messages.map(msg => ({
                type: msg.type,
                content: msg.content,
                isImage: Array.isArray(msg.content), // optional logic
                sources: msg.sources || [],
                timestamp: msg.timestamp
            }));

            socket.emit('chat_history', formatted);
        } catch (error) {
            logger.error(`Error retrieving chat history: ${error.message}`);
            socket.emit('error', { message: 'Failed to load chat history' });
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