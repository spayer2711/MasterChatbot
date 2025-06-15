import React, { useState, useEffect, useRef } from 'react';
import { useChatbot } from './useChatbot';
import { ImageOverlay } from './ImageOverlay';
import BotImg from "../assets/bot.gif"
import '../styles/ChatbotWidget.scss';

export const ChatbotWidget = () => {
  const { messages, sendMessage, sendImages, isLoading, isConnected, error } = useChatbot();
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [overlayImages, setOverlayImages] = useState(null);
  const [overlayStartIndex, setOverlayStartIndex] = useState(0);
  const [hasUrlBeenProvided, setHasUrlBeenProvided] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    scrollToBottom();
    // Pretty print the messages array
    // console.log('Messages array:', JSON.stringify(messages, null, 2));
    
    // Log each message separately for better readability
    // messages.forEach((msg, index) => {
    //   console.log(`Message ${index}:`, {
    //     type: msg.type,
    //     content: msg.content,
    //     sources: msg.sources,
    //     timestamp: msg.timestamp,
    //     isError: msg.isError,
    //     isImage: msg.isImage
    //   });
    // });
  }, [messages, isLoading]);

  // Check if URL has been provided in messages
  useEffect(() => {
    // const urlMessage = messages.find(msg => 
    //   msg.type === 'user' && 
    //   msg.content.startsWith('Learning from URL:')
    // );
    // setHasUrlBeenProvided(!!urlMessage);
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      sendImages(imageFiles);
      e.target.value = ''; // Reset file input
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleImageClick = (images, startIndex = 0) => {
    setOverlayImages(images);
    setOverlayStartIndex(startIndex);
  };

  const handleOverlayClose = () => {
    setOverlayImages(null);
  };

  const renderInputPlaceholder = () => {
    if (!isConnected) return 'Connecting to server...';
    return 'Type your question here...';
  };

  const renderConnectionStatus = () => {
    if (!isConnected) {
      return <div className="connection-status error">Disconnected from server</div>;
    }
    if (error) {
      return <div className="connection-status error">{error}</div>;
    }
    return null;
  };

  return (
    <div className="chatbot-container">
      <button 
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={()=> handleOpen()}
        aria-label="Open chat"
      >
        <div className="bot-icon">
          <img src={BotImg} alt="bot logo" />
        </div>
      </button>

      <div className={`chatbot-widget ${isOpen ? 'open' : ''} ${isClosing ? 'closing' : ''}`}>
        <div className="chatbot-header">
          <h2>Master Chatbot</h2>
          <button onClick={handleClose} className="close-button" aria-label="Close chat">
            ×
          </button>
        </div>

        {renderConnectionStatus()}

        <div className="chatbot-messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.type} ${message.isError ? 'error' : ''}`}>
              {/* <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
                {JSON.stringify(message, null, 2)}
              </pre> */}
              {message.isImage ? (
                <div className="image-grid">
                  {message.content.map((url, imgIndex) => (
                    <img 
                      key={imgIndex} 
                      src={url} 
                      alt={`User upload ${imgIndex + 1}`}
                      onClick={() => handleImageClick(message.content, imgIndex)}
                    />
                  ))}
                </div>
              ) : (
                <div className="message-content">
                  {message.content}
                  {/* {message.sources && (
                    <div className="message-sources">
                      <small>Sources: {message.sources.length} references found</small>
                    </div>
                  )} */}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="message bot loading">
              <div className="loading-placeholder">
                <span className='loading-line'></span>
                <span className='loading-line'></span>
                <span className='loading-line'></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="chatbot-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={renderInputPlaceholder()}
            disabled={!isConnected}
          />
          <button type="button" onClick={handleFileClick} className="attach-button">
            📎
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button type="submit" disabled={!input.trim() || !isConnected}>
            Send
          </button>
        </form>
      </div>

      {overlayImages && (
        <ImageOverlay
          images={overlayImages}
          startIndex={overlayStartIndex}
          onClose={handleOverlayClose}
        />
      )}
    </div>
  );
};
