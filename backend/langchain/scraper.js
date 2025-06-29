const { CheerioWebBaseLoader } = require('langchain/document_loaders/web/cheerio');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const { MemoryVectorStore } = require('langchain/vectorstores/memory');
const logger = require('../utils/logger');
const config = require('../config/chatbot');
const cheerio = require('cheerio');
require('dotenv').config();

function extractImages(html) {
  const $ = cheerio.load(html);
  const images = [];

  $('img').each((_, el) => {
    const src = $(el).attr('src');
    if (src && src.startsWith('http')) {
      images.push(src);
    }
  });

  return images;
}

class WebScraper {
    constructor() {
        this.vectorStore = null;
        this.isInitialized = false;
        this.embeddings = null;
    }

    createMockVectorStore() {
        return {
            asRetriever: () => ({
                getRelevantDocuments: async () => []
            })
        };
    }
    

    async fetchUrlsFromMongo() {
        const { MongoClient } = require('mongodb');

        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db('webscraper');
        const collection = db.collection('urls');

        const documents = await collection.find({}).toArray();
        await client.close();
        const urls = documents.map(doc => doc.url).filter(Boolean);
        logger.info(`URL List: ${urls}`);
        // Assuming the field is called `url`
        return urls;
    }

    async initialize() {
        if (this.isInitialized) {
            logger.info('WebScraper already initialized');
            return;
        }

        try {
            if (!process.env.OPENAI_API_KEY) {
                logger.warn('OPENAI_API_KEY is not set in environment variables');
                this.vectorStore = this.createMockVectorStore();
                this.isInitialized = true;
                return;
            }

            const urls = await this.fetchUrlsFromMongo();
            logger.info(`Fetched ${urls.length} URLs from MongoDB`);

            let allSplitDocs = [];

            for (const url of urls) {
                logger.info(`Scraping URL: ${url}`);
                const splitDocs = await this.scrapeUrl(url);
                allSplitDocs.push(...splitDocs);
            }

            logger.info('Creating combined vector store');
            this.embeddings = new OpenAIEmbeddings({
                openAIApiKey: process.env.OPENAI_API_KEY,
                maxRetries: 1
            });

            this.vectorStore = await MemoryVectorStore.fromDocuments(
                allSplitDocs,
                this.embeddings
            );

            this.isInitialized = true;
            logger.info('WebScraper initialization complete');
        } catch (error) {
            logger.error(`Error initializing WebScraper: ${error.message}`);
            logger.info('Falling back to mock vector store');
            this.vectorStore = this.createMockVectorStore();
            this.isInitialized = true;
        }
    }

    async scrapeUrl(url) {
    try {
        logger.info(`Loading content from URL: ${url}`);
        const loader = new CheerioWebBaseLoader(url);
        const docs = await loader.load();

        logger.info('Splitting documents');
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200
        });

        const splitDocs = await textSplitter.splitDocuments(docs);

        // 🛠 Attach metadata to each split doc
        const enhancedDocs = splitDocs.map(doc => {
            doc.metadata = {
                ...doc.metadata,
                source: url,
                images: extractImages(doc.pageContent), // optional
            };
            return doc;
        });

        return enhancedDocs;
    } catch (error) {
        logger.error(`Error scraping URL ${url}: ${error.message}`);
        return [];
    }
}



    async queryContent(query) {
    try {
        if (!this.vectorStore) {
            throw new Error('No content has been scraped yet');
        }

        logger.info(`Querying content with: ${query}`);

        // Search for relevant documents
        const results = await this.vectorStore.similaritySearch(query, 3);

        // Format the results
        const formattedResults = results.map(doc => ({
            content: doc.pageContent,
            metadata: doc.metadata
        }));

        logger.info(`Found ${formattedResults.length} relevant results`);
        return formattedResults;
    } catch (error) {
        logger.error(`Error querying content: ${error.message}`);
        throw error;
    }
}
}

module.exports = new WebScraper();
