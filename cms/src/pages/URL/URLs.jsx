// src/pages/URLs.js
import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import UrlTable from './Table';
import NoData from '../../components/NoData';
import Loader from '../../components/Loader';
import { apiRequest } from '../../config/APIWrapper';
import DeleteConfirmDialog from '../../components/DeleteConfirm';
import AddUrlDrawer from './AddUrlDrawer';
import { toast } from 'react-toastify';

const URLs = () => {
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const URL_API_PATH = '/api/urls';

    const getUrls = () => apiRequest(URL_API_PATH, 'POST', { action: 'get' })
    const addUrls = (url) => apiRequest(URL_API_PATH, 'POST', { action: 'add', url })
    const deleteUrl=(id) => apiRequest(URL_API_PATH, 'POST', { action: 'delete', id }) 
    const fetchUrls = async () => {
        setLoading(true);
        try {
            const result = await getUrls();
            setUrls(result.data || []);
        } catch (err) {
            toast.error('Failed to load URL.');
        } finally {
            setLoading(false);
        }
    };


    const handleDelete = (id, url) => {
        setSelectedId(id);
        setDeleteDialogOpen(true);
    };

    // On confirm delete:
    const handleConfirmDelete = async () => {
        await deleteUrl(selectedId);
        setDeleteDialogOpen(false);
        setSelectedId("");
        fetchUrls(); // Refresh the list
    };

    const handleAddUrl = async (newUrl) => {
        toast.success('URL added successfully!');
        try {
            await addUrls(newUrl);
            setDrawerOpen(false);
            setLoading(true);
            fetchUrls();
        } catch (err) {
            toast.error('Failed to add URL.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUrls();
    }, []);

    return (
        <Box>
            <div className='page-header'>
                <h4 className='page-title'>Tained URLs</h4>
                <button className='primary-btn' onClick={() => setDrawerOpen(true)}>Add Url</button>
            </div>
            {loading && <Loader />}
            {urls.length === 0 && !loading ? (
                <NoData message="No trained URLs found." />
            ) : (
                !loading && <UrlTable data={urls} onDelete={handleDelete} />
            )}
            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
            />
            <AddUrlDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onSubmit={handleAddUrl}
            /> 
        </Box>
    );
};

export default URLs;
