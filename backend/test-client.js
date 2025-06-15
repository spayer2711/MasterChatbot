const io = require('socket.io-client');

const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Connected to server');
    
    // Send a test message
    socket.emit('chat_message', 'Hello from test client');
});

socket.on('bot_response', (response) => {
    console.log('Received bot response:', response);
});

socket.on('error', (error) => {
    console.error('Error:', error);
});

// Keep the script running for a few seconds
setTimeout(() => {
    socket.disconnect();
    process.exit(0);
}, 5000);
