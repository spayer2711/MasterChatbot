import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { getCookie, setCookie } from '../utils/Cookies';
import { apiRequest } from '../api/APIWrapper';

export const useChatbot = () => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const socketRef = useRef(null);

    const WELCOME_MESSAGE = {
        type: 'bot',
        content: 'Hello! 👋 I am Master Chatbot. I can help you learn about GitHub basics. Ask me anything!'
    };

    const generateSessionId = () => {
        return [...Array(16)]
            .map(() => Math.random().toString(36)[2])
            .join('');
    };

    const getOrCreateSessionId = () => {
        let sessionId = getCookie('sessionId');
        if (!sessionId) {
            sessionId = generateSessionId();
            setCookie('sessionId', sessionId, 1); 
        }
        return sessionId;
    };

    useEffect(() => {
        // Initialize socket connection
        socketRef.current = io('http://localhost:3000');

        // Socket event handlers
        socketRef.current.on('connect', () => {
            setIsConnected(true);
            setError(null);
            addMessage(WELCOME_MESSAGE);
            const sessionId = getOrCreateSessionId()
            socketRef.current.emit('get_chat_history', sessionId)
        });

        socketRef.current.on('disconnect', () => {
            setIsConnected(false);
            setError('Lost connection to server');
        });

        socketRef.current.on('chat_history', (history) => {
            setMessages([WELCOME_MESSAGE, ...history]);
        });

        socketRef.current.on('bot_response', (response) => {
            setIsLoading(false);
            // Handle string responses
            if (typeof response === 'string') {
                addMessage({
                    type: 'bot',
                    content: response,
                    timestamp: new Date().toISOString()
                });
                return;
            }

            // Handle object responses
            const content = response.content || response.answer || 'No response received';
            const formattedResponse = {
                type: 'bot',
                content: typeof content === 'string' ? content : JSON.stringify(content),
                sources: Array.isArray(response.sources) ? response.sources : [],
                timestamp: response.timestamp || new Date().toISOString()
            };
            addMessage(formattedResponse);
        });

        socketRef.current.on('error', (error) => {
            setIsLoading(false);
            const errorMessage = typeof error === 'string' ? error :
                error.message || 'An unknown error occurred';

            setError(errorMessage);
            addMessage({
                type: 'bot',
                content: `Error: ${errorMessage}`,
                isError: true,
                timestamp: new Date().toISOString()
            });
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const addMessage = (message) => {
        setMessages(prev => [...prev, message]);
    };

    const sendMessage = async (content) => {
        if (!isConnected) {
            setError('Not connected to server');
            return;
        }

        setIsLoading(true);
        addMessage({
            type: 'user',
            content,
            timestamp: new Date().toISOString()
        });
        const sessionId = getOrCreateSessionId()
        socketRef.current.emit('chat_message', { content, sessionId });
    };

    const sendImages = async (files) => {
        const imagePromises = files.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
        });

        const imageUrls = await Promise.all(imagePromises);
        addMessage({
            type: 'user',
            content: imageUrls,
            isImage: true,
            timestamp: new Date().toISOString()
        });
    };
    
    const URL_API_PATH = '/api/conversation';

    const submitWelomeForm=(data)=>{
        console.log(data, "data 140")
        const sessionId = getOrCreateSessionId(); 
        apiRequest(URL_API_PATH, 'POST', { 
            action: 'add',  
            sessionId: sessionId,
            ...data
        })
        socketRef.current.emit('get_chat_history', sessionId)
    }

    return {
        messages,
        isLoading,
        isConnected,
        error,
        sendMessage,
        sendImages,
        submitWelomeForm,
        setMessages
    };
};
