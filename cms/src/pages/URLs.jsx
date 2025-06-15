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
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';

// Dummy data for demonstration
const initialUrls = [
  {
    id: 1,
    url: 'https://example.com/docs',
    status: 'processed',
    lastUpdated: '2025-05-24',
  },
  {
    id: 2,
    url: 'https://example.com/api',
    status: 'processing',
    lastUpdated: '2025-05-24',
  },
];

const URLs = () => {
  const [urls, setUrls] = useState(initialUrls);

  const handleDelete = (id) => {
    setUrls(urls.filter((url) => url.id !== id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed':
        return 'success';
      case 'processing':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Trained URLs
      </Typography>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>URL</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {urls.map((url) => (
                <TableRow key={url.id}>
                  <TableCell>{url.url}</TableCell>
                  <TableCell>
                    <Chip
                      label={url.status}
                      color={getStatusColor(url.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{url.lastUpdated}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      aria-label="refresh url"
                      size="small"
                    >
                      <RefreshIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      aria-label="delete url"
                      size="small"
                      onClick={() => handleDelete(url.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default URLs;
