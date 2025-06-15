import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

export const useChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const chatHistoryRef = useRef([]);

  const WELCOME_MESSAGE = {
    type: 'bot',
    content: 'Hello! 👋 I am Master Chatbot. I can help you learn about GitHub basics. Ask me anything!'
  };

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('http://localhost:3000');

    // Socket event handlers
    socketRef.current.on('connect', () => {
      setIsConnected(true);
      setError(null);
      addMessage(WELCOME_MESSAGE);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      setError('Lost connection to server');
    });

    socketRef.current.on('bot_response', (response) => {
      setIsLoading(false);
      console.log(response, "response")
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

      console.log('Formatted bot response:', formattedResponse);
      addMessage(formattedResponse);

      // Update chat history
      if (messages.length > 0) {
        const lastUserMessage = messages[messages.length - 1];
        chatHistoryRef.current.push({
          question: lastUserMessage.content,
          answer: formattedResponse.content
        });
      }
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
    // console.log('Adding message:', {
    //   raw: message,
    //   stringified: JSON.stringify(message, null, 2),
    //   keys: Object.keys(message),
    //   type: typeof message,
    //   hasContent: 'content' in message,
    //   contentType: typeof message.content
    // });
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
    
    socketRef.current.emit('chat_message', {
      content,
      chatHistory: chatHistoryRef.current
    });
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

  return {
    messages,
    isLoading,
    isConnected,
    error,
    sendMessage,
    sendImages
  };
};
