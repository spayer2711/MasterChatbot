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
            if (!process.env.OPENAI_API_KEY) {
                logger.warn('OPENAI_API_KEY is not set in environment variables');
                this.model = null;
                return;
            }

            if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
                logger.warn('Invalid OpenAI API key format');
                this.model = null;
                return;
            }

            this.model = new OpenAI({
                openAIApiKey: process.env.OPENAI_API_KEY,
                temperature: 0.7,
                modelName: 'gpt-3.5-turbo',
                maxRetries: 1  // Reduce retries to fail fast if API is unavailable
            });
        } catch (error) {
            logger.error(`Error initializing OpenAI model: ${error.message}`);
            this.model = null;
        }
    }

    getMockResponse(query) {
        return {
            answer: "I'm currently in offline mode. I can still help you with general questions, but I may not have the most up-to-date or detailed information right now.",
            sources: [{
                content: "This is a fallback response when the assistant is in offline mode.",
                metadata: {
                    source: "https://example.com/offline-mode-info"
                }
            }]
        };
    }

    isGreetingMessage(message) {
        const greetings = ['hi', 'hello', 'hey', 'yo', 'hola'];
        const normalized = message.trim().toLowerCase();
        return greetings.some(g => normalized.startsWith(g));
    }    

    async initialize(vectorStore) {
        try {
            if (!this.model) {
                logger.info('OpenAI model not initialized, will use mock responses');
                return;
            }

            logger.info('Initializing retrieval chain');
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
            logger.info('Successfully initialized retrieval chain');
        } catch (error) {
            logger.error(`Error initializing retrieval chain: ${error.message}`);
            this.model = null;  // Reset model on error
            logger.info('Falling back to mock responses');
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
    
            logger.info(`Getting response for query: ${query}`);
            const response = await this.chain.call({
                question: query,
                chat_history: chatHistory
            });
    
            logger.info('Raw chain response:', JSON.stringify(response, null, 2));
    
            const formattedSources = Array.isArray(response.sourceDocuments)
                ? response.sourceDocuments.map(doc => {
                    const sourceData = {
                        content: doc.pageContent,
                        metadata: doc.metadata || {}
                    };
    
                    // Optionally attach image if available in metadata
                    if (doc.metadata?.image) {
                        sourceData.image = doc.metadata.image;
                    }
    
                    return sourceData;
                })
                : [];
    
            const formattedResponse = {
                answer: response.text || response.answer || 'No answer found',
                sources: formattedSources
            };
    
            logger.info('Formatted response:', JSON.stringify(formattedResponse, null, 2));
    
            return formattedResponse;
        } catch (error) {
            logger.error(`Error getting response: ${error.message}`);
            logger.info('Falling back to mock response');
            return this.getMockResponse(query);
        }
    }    
}

module.exports = new Retriever();
