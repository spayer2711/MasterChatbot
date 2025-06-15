chatbot-platform/
│
├── backend/            # Backend Server
│   ├── controllers/    # Handles API logic
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic & third-party integrations
│   ├── utils/          # Helper functions
│   ├── config/         # Configuration files (env, DB)
│   ├── langchain/      # LangChain-specific scraping & NLP logic
│   │   ├── scraper.js       # Scrapes website content
│   │   ├── embeddings.js    # Embedding & vector storage
│   │   ├── retriever.js     # Query processing & response retrieval
│   ├── app.js          # Express server setup
│   ├── server.js       # Entry point
│   ├── package.json    # Dependencies & scripts
│
├── frontend/           # Frontend Client
│   ├── src/
│   │   ├── app/ 
│   │   ├── components/  # Shared UI Components
│   │   ├── hooks/       # Custom React Hooks
│   │   ├── utils/       # Helper functions
│   │   ├── api/         # API calls to backend
│   │   ├── lib/         # Shared libraries
│   │   ├── chatbot/     # Chatbot UI + Integration
│   │   │   ├── ChatbotWidget.js   # React Chatbot Component
│   │   │   ├── useChatbot.js      # Hook for chatbot logic
│   │   ├── store/       # State management (Redux/Context API)
│   │   ├── pages/       # Application Pages
│   ├── public/
│   │   ├── css/
│   │   ├── fonts/
│   │   ├── js/
│   │   ├── img/
│   ├── vite.config.js   # Vite Config
│   ├── package.json     # Dependencies & scripts
│
├── .gitignore          # Ignore unnecessary files
└── README.md           # Project Documentation
