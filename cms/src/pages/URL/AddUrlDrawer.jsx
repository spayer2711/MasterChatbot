// src/components/AddUrlDrawer.js
import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const AddUrlDrawer = ({ open, onClose, onSubmit }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = () => {
    if (!url.trim()) return;
    onSubmit(url.trim());
    setUrl('');
    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} 
    sx={{
      zIndex: (theme) => theme.zIndex.modal + 10  // ensures it's above modals (default: 1300)
    }}>
      <Box sx={{ width: 350, p: 3 }} role="presentation">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Add New URL</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <TextField
          label="Enter URL"
          variant="outlined"
          fullWidth
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
          onClick={handleSubmit}
        >
          Add URL
        </Button>
      </Box>
    </Drawer>
  );
};

export default AddUrlDrawer;
