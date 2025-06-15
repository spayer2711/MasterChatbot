const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const logger = require('../utils/logger');

class EmbeddingsHandler {
    constructor() {
        this.embeddings = new OpenAIEmbeddings();
    }

    async generateEmbeddings(text) {
        try {
            logger.info('Generating embeddings for text');
            const embeddings = await this.embeddings.embedQuery(text);
            logger.info('Successfully generated embeddings');
            return embeddings;
        } catch (error) {
            logger.error(`Error generating embeddings: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new EmbeddingsHandler();
