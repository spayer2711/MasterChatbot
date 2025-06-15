const io = require('socket.io-client');
const dotenv = require('dotenv');
const logger = require('./utils/logger');
const config = require('./test-config');

dotenv.config();

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

class LangChainTester {
    constructor() {
        this.socket = io('http://localhost:3000');
        this.chatHistory = [];
        this.currentTestUrl = config.TEST_URLS[0];
        this.testResults = {
            scraping: false,
            questions: 0,
            errors: 0
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        switch(type) {
            case 'success':
                console.log(`${colors.green}[${timestamp}] ✓ ${message}${colors.reset}`);
                break;
            case 'error':
                console.log(`${colors.red}[${timestamp}] ✗ ${message}${colors.reset}`);
                break;
            case 'info':
                console.log(`${colors.yellow}[${timestamp}] ℹ ${message}${colors.reset}`);
                break;
            case 'header':
                console.log(`\n${colors.blue}${colors.bright}${message}${colors.reset}\n`);
                break;
        }
    }

    setupSocketListeners() {
        this.socket.on('connect', () => {
            this.log('Connected to server', 'success');
        });

        this.socket.on('scrape_complete', (data) => {
            this.log(`URL scraping completed: ${this.currentTestUrl.url}`, 'success');
            this.testResults.scraping = true;
            this.runQuestionTests();
        });

        this.socket.on('bot_response', (response) => {
            this.log('Received bot response:', 'success');
            this.log(`Q: ${this.currentQuestion}`, 'info');
            this.log(`A: ${response.content}`, 'info');
            
            if (response.sources && response.sources.length > 0) {
                this.log('Sources found in response', 'success');
                this.testResults.questions++;
            }
            
            this.chatHistory.push({
                question: this.currentQuestion,
                answer: response.content
            });
        });

        this.socket.on('error', (error) => {
            this.log(`Error: ${error.message}`, 'error');
            this.testResults.errors++;
        });

        this.socket.on('disconnect', () => {
            this.log('Disconnected from server', 'info');
        });
    }

    async testUrlScraping() {
        this.log('Starting URL Scraping Test', 'header');
        this.log(`Testing URL: ${this.currentTestUrl.url}`, 'info');
        this.log(`Expected topics: ${this.currentTestUrl.expectedTopics.join(', ')}`, 'info');
        
        this.socket.emit('scrape_url', this.currentTestUrl.url);
    }

    async runQuestionTests() {
        this.log('Starting Question-Answer Tests', 'header');
        
        for (const testCase of config.TEST_QUESTIONS) {
            this.log(`Testing question: ${testCase.question}`, 'info');
            this.log(`Expected topics: ${testCase.expectedTopics.join(', ')}`, 'info');
            
            this.currentQuestion = testCase.question;
            this.socket.emit('chat_message', {
                content: testCase.question,
                chatHistory: this.chatHistory
            });

            // Wait before next question
            await new Promise(resolve => setTimeout(resolve, config.TIMEOUTS.response));
        }

        // Wait for final responses
        setTimeout(() => this.printTestSummary(), config.TIMEOUTS.response);
    }

    printTestSummary() {
        this.log('Test Summary', 'header');
        this.log(`URL Scraping: ${this.testResults.scraping ? 'Successful' : 'Failed'}`, 
            this.testResults.scraping ? 'success' : 'error');
        this.log(`Questions Answered: ${this.testResults.questions}/${config.TEST_QUESTIONS.length}`, 
            this.testResults.questions === config.TEST_QUESTIONS.length ? 'success' : 'error');
        this.log(`Errors Encountered: ${this.testResults.errors}`, 
            this.testResults.errors === 0 ? 'success' : 'error');
        
        // Cleanup and exit
        setTimeout(() => {
            this.socket.disconnect();
            process.exit(this.testResults.errors === 0 ? 0 : 1);
        }, config.TIMEOUTS.disconnect);
    }

    async runTests() {
        this.setupSocketListeners();
        await this.testUrlScraping();
    }
}

// Run the tests
console.log(`${colors.bright}LangChain Integration Tests${colors.reset}`);
console.log(`${colors.bright}========================${colors.reset}\n`);
const tester = new LangChainTester();
tester.runTests();
