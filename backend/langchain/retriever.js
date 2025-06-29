const { OpenAI } = require('langchain/llms/openai');
const { ConversationalRetrievalQAChain } = require('langchain/chains');
const { MemoryVectorStore } = require('langchain/vectorstores/memory');
const logger = require('../utils/logger');
const config = require('../config/chatbot');
require('dotenv').config();

class Retriever {
    constructor() {
        this.initializeModel();
        this.chain = null;
    }

    initializeModel() {
        try {
            const key = process.env.OPENAI_API_KEY;
            if (!key) {
                logger.warn('OPENAI_API_KEY is not set in environment variables');
                this.model = null;
                return;
            }

            if (!key.startsWith('sk-')) {
                logger.warn('Invalid OpenAI API key format');
                this.model = null;
                return;
            }

            this.model = new OpenAI({
                openAIApiKey: key,
                temperature: 0.7,
                modelName: 'gpt-3.5-turbo',
                maxRetries: 1
            });
        } catch (error) {
            logger.error(`Error initializing OpenAI model: ${error.message}`);
            this.model = null;
        }
    }

    getMockResponse(query) {
        return {
            answer: "I'm currently in offline mode. I can still help with general questions, but I might not have the most relevant data.",
            sources: [{
                content: "<p>This is a fallback response when the assistant is in offline mode.</p>",
                source: "https://example.com/offline-mode-info",
                images: [],
                title: "Offline Mode",
                heading: "Fallback Answer"
            }]
        };
    }

    isAboutMeMessage(message) {
        const aboutQueries = [
            'who are you',
            'what are you',
            'tell me about you',
            'tell me about yourself',
            'about you',
            'who designed you',
            'what is your name',
            'who built you',
            'what your purpose'
        ];
        const normalized = message.trim().toLowerCase();
        return aboutQueries.some(q => normalized.includes(q));
    }

    isGreetingMessage(message) {
        const greetings = ['hi', 'hello', 'hey', 'yo', 'hola'];
        const normalized = message.trim().toLowerCase();
        return greetings.some(greet => normalized.startsWith(greet));
    }

    async initialize(vectorStore) {
        try {
            if (!this.model) {
                logger.info('OpenAI model not initialized, fallback active');
                return;
            }

            logger.info('Initializing conversational retrieval chain...');
            this.chain = ConversationalRetrievalQAChain.fromLLM(
                this.model,
                vectorStore.asRetriever(),
                {
                    returnSourceDocuments: true,
                    questionGeneratorTemplate: `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question that captures all relevant context from the conversation.
                    Chat History:
                    {chat_history}
                    Follow Up Input: {question}
                    Standalone question:`,
                }
            );
            logger.info('Retriever chain initialized successfully');
        } catch (error) {
            logger.error(`Failed to initialize retriever chain: ${error.message}`);
            this.model = null;
        }
    }

    async getResponse(query, chatHistory = []) {
        try {
            if (!this.model || !this.chain) {
                logger.info('Using mock response system');
                return this.getMockResponse(query);
            }

            const isGreeting = this.isGreetingMessage(query);
            if (isGreeting) {
                return {
                    answer: 'Hello! 👋 I am Master Chatbot. Ask me anything!',
                    sources: []
                };
            }

            if (this.isAboutMeMessage(query)) {
                return {
                    answer: `🤖 I am Master Chatbot, designed by Shubham Payer and Santosh Pal to answer queries based on trained URLs.`,
                    sources: []
                };
            }

            logger.info(`Getting response for query: ${query}`);
            const response = await this.chain.call({
                question: query,
                chat_history: chatHistory
            });

            logger.info('Raw chain response:', JSON.stringify(response, null, 2));

            const sourceDocs = Array.isArray(response.sourceDocuments) ? response.sourceDocuments : [];

            if (sourceDocs.length === 0) {
                logger.info('No relevant documents found. Blocking model answer.');
                return {
                    answer: "❌ Sorry, I couldn't find any relevant information on that topic.",
                    sources: []
                };
            }

            // ✅ Format documents
            const formattedSources = sourceDocs.map(doc => {
            const { pageContent, metadata = {} } = doc;

            return {
                content: pageContent, // This is HTML
                source: {
                image: Array.isArray(metadata.images) && metadata.images.length > 0
                    ? metadata.images[0]
                    : 'https://via.placeholder.com/150',
                url: metadata.source || 'Unknown source'
                }
            };
            });

            return {
                answer: response.text || response.answer || 'No answer found',
                sources: formattedSources
            };

        } catch (error) {
            logger.error(`Error getting response: ${error.message}`);
            return this.getMockResponse(query);
        }
    }

}

module.exports = new Retriever();
