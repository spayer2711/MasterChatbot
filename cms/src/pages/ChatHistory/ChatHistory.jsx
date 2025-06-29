import { useState, useEffect } from 'react';
import HistoryTable from "./Table"
import {apiRequest} from "../../config/APIWrapper"
import { toast } from 'react-toastify';
import NoData from '../../components/NoData';
import Loader from '../../components/Loader';
import AddChatDrawer from './AddChatDrawer';
import { Box, Typography } from '@mui/material';

const ChatHistory = () => {
    const [chats, setChats] = useState([]);
    const [conversation, setConversation] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const URL_API_PATH = '/api/conversation';

    const getConversation = () => apiRequest(URL_API_PATH, 'POST', { action: 'get' })
    const getMessages = (sessionId) => apiRequest(URL_API_PATH, 'POST', { action: 'getMessages', sessionId })
    const fetchConversation = async () => {
        setLoading(true);
        try {
            const result = await getConversation();
            setConversation(result.conversation || []);
        } catch (err) {
            toast.error('Failed to load conversation.');
        } finally {
            setLoading(false);
        }
    };

    const handleClickOpen = async(chatId) => {
        try{
            const result = await getMessages(chatId);
            setChats(result.messages || [])
            setDrawerOpen(true);
        }catch(err){
            toast.error('Failed to load conversation history.')
        }
    };

    const handleClose = () => {
        setDrawerOpen(false);
    };

    useEffect(() => {
        fetchConversation();
    }, []);

    return (
        <Box>
            <div className='page-header'>
                <h4 className='page-title'>Conversation History</h4>
            </div>
            {loading && <Loader />}
            {conversation.length === 0 && !loading ? (
                <NoData message="No trained URLs found." />
            ) : (
                !loading && <HistoryTable data={conversation} handleClickOpen={handleClickOpen} />
            )}
            <AddChatDrawer
                open={drawerOpen}
                onClose={() => handleClose()}
                chats={chats}
            /> 
        </Box>
    );
};

export default ChatHistory;
