import { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Dummy data for demonstration
const initialChats = [
  {
    id: 1,
    sessionId: 'session_123',
    userMessage: 'How do I integrate the API?',
    botResponse: 'To integrate the API, you need to follow these steps...',
    timestamp: '2025-05-24 15:30:00',
    sourceUrl: 'https://example.com/docs/api',
  },
  {
    id: 2,
    sessionId: 'session_124',
    userMessage: 'What are the authentication methods?',
    botResponse: 'We support the following authentication methods...',
    timestamp: '2025-05-24 15:35:00',
    sourceUrl: 'https://example.com/docs/auth',
  },
];

const ChatHistory = () => {
  const [chats] = useState(initialChats);
  const [selectedChat, setSelectedChat] = useState(null);
  const [open, setOpen] = useState(false);

  const handleClickOpen = (chat) => {
    setSelectedChat(chat);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Chat History
      </Typography>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Session ID</TableCell>
                <TableCell>User Message</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>Source URL</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {chats.map((chat) => (
                <TableRow key={chat.id}>
                  <TableCell>{chat.sessionId}</TableCell>
                  <TableCell>{chat.userMessage}</TableCell>
                  <TableCell>{chat.timestamp}</TableCell>
                  <TableCell>{chat.sourceUrl}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      aria-label="view details"
                      size="small"
                      onClick={() => handleClickOpen(chat)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chat Details</DialogTitle>
        <DialogContent>
          {selectedChat && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Session ID: {selectedChat.sessionId}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Timestamp: {selectedChat.timestamp}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Source URL: {selectedChat.sourceUrl}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">User Message:</Typography>
                <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
                  {selectedChat.userMessage}
                </Paper>
                <Typography variant="h6">Bot Response:</Typography>
                <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  {selectedChat.botResponse}
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatHistory;
