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

const AddChatDrawer = ({ open, onClose, chats }) => {
    const formatDateTime = (input) => {
        const date = new Date(input);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${day}-${month}-${year} | ${hours}:${minutes}`;
    };
    return (
        <Drawer anchor="right" open={open} onClose={onClose}
            sx={{
                zIndex: (theme) => theme.zIndex.modal + 10
            }}>
            <Box sx={{ width: 550, p: 3 }} role="presentation">
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Conversation History</Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Divider sx={{ mb: 2 }} />
                <div className='chat-history-wrap'>
                    {
                        chats?.map((chat) => {
                            return (
                                <div className={`chat-bubble ${chat?.type}`}>
                                    <div className='chat-content'>{chat?.content}</div>
                                    <div className='chat-date'>{formatDateTime(chat?.timestamp)}</div>
                                </div>
                            )
                        })
                    }
                </div>
            </Box>
        </Drawer>
    );
};

export default AddChatDrawer;
