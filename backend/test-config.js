module.exports = {
    // Test URLs with different content types
    TEST_URLS: [
        {
            url: 'https://docs.github.com/en/get-started/quickstart/hello-world',
            description: 'GitHub Hello World guide',
            expectedTopics: ['Git', 'GitHub', 'Repository', 'Branch', 'Commit']
        },
        {
            url: 'https://www.example.com',
            description: 'Basic HTML page',
            expectedTopics: ['Domain names', 'Example domains', 'Documentation']
        },
        // Add more test URLs as needed
    ],

    // Test questions for different scenarios
    TEST_QUESTIONS: [
        {
            question: 'What is a repository?',
            expectedTopics: ['repository', 'project', 'files']
        },
        {
            question: 'How do you create a branch?',
            expectedTopics: ['branch', 'create', 'repository']
        },
        {
            question: 'What is the purpose of making commits?',
            expectedTopics: ['commit', 'changes', 'save']
        },
        {
            question: 'What is the main topic of this page?',
            expectedTopics: ['main subject', 'primary focus', 'key theme']
        },
        {
            question: 'Can you summarize the key points?',
            expectedTopics: ['main points', 'summary', 'overview']
        },
        {
            question: 'What are the important details mentioned?',
            expectedTopics: ['specific information', 'details', 'facts']
        }
    ],

    // Test timeouts
    TIMEOUTS: {
        scraping: 15000,    // 15 seconds for scraping
        response: 10000,    // 10 seconds for each response
        disconnect: 2000    // 2 seconds before disconnect
    }
};
