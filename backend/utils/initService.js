// utils/initServices.js
const logger = require('../utils/logger');
const webScraper = require('../langchain/scraper');
const retriever = require('../langchain/retriever');

const initializeServices = async () => {
  try {
    logger.info('Initializing services...');
    await webScraper.initialize();
    await retriever.initialize(webScraper.vectorStore);
    logger.info('Services initialized successfully');
  } catch (error) {
    logger.error('Error initializing services:', error);
    throw error;
  }
};

module.exports = { initializeServices };
