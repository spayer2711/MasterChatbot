import React, { useState, useEffect, useRef } from 'react';
import { useChatbot } from './useChatbot';
import { ImageOverlay } from './ImageOverlay';
import BotImg from "../assets/bot.gif"
import { deleteCookie, getCookie } from "../utils/Cookies.jsx"
import WelcomeForm from './WelcomeForm.jsx';
import '../styles/ChatbotWidget.scss';

export const ChatbotWidget = () => {
    const { messages, setMessages, sendMessage, sendImages, isLoading, isConnected, error, submitWelomeForm } = useChatbot();
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [overlayImages, setOverlayImages] = useState(null);
    const [overlayStartIndex, setOverlayStartIndex] = useState(0);
    const [showWelcomeForm, setShowWelcomeForm] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => setMenuOpen(!menuOpen);
    const handleCloseChat = () => {
        deleteCookie('sessionId')
        setMessages([])
        setMenuOpen(false);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

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
            e.target.value = '';
        }
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsOpen(false);
            setIsClosing(false);
        }, 300);
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

    useEffect(() => {
        const sessionId = getCookie('sessionId');
        if (!sessionId && messages.length === 0) {
            setShowWelcomeForm(true);
        }
    }, [messages]);

    return (
        <div className="chatbot-container">
            <button
                className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
                onClick={() => handleOpen()}
                aria-label="Open chat"
            >
                <div className="bot-icon">
                    <img src={BotImg} alt="bot logo" />
                </div>
            </button>

            <div className={`chatbot-widget ${isOpen ? 'open' : ''} ${isClosing ? 'closing' : ''}`}>
                <div className="chatbot-header">
                    <h2>Master Chatbot</h2>
                    <div className="menu-container">
                        <button onClick={toggleMenu} className="close-button" aria-label="Close chat">
                            ⋮
                        </button>
                        <button onClick={handleClose} className="close-button" aria-label="Close chat">
                            ×
                        </button>
                        {menuOpen && (
                            <div className="menu-dropdown">
                                <button onClick={handleCloseChat}>Close Chat</button>
                            </div>
                        )}
                    </div>
                </div>
                {renderConnectionStatus()}
                {
                    showWelcomeForm ?
                        <WelcomeForm submitWelomeForm={submitWelomeForm} setShowWelcomeForm={setShowWelcomeForm} />
                        :
                        <div className="chatbot-messages">

                            {messages.map((message, index) => (
                                <div key={index} className={`message ${message.type} ${message.isError ? 'error' : ''}`}>
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
                }

                {!showWelcomeForm && <form onSubmit={handleSubmit} className="chatbot-input">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={renderInputPlaceholder()}
                        disabled={!isConnected}
                    />
                    <button type="submit" disabled={!input.trim() || !isConnected}>
                        Send
                    </button>
                </form>}
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
