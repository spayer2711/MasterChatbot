import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

const formatDateTime = (input) => {
  const date = new Date(input);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}-${month}-${year} | ${hours}:${minutes}`;
};


const HistoryTable = ({ data, handleClickOpen }) => {
  return (
    <Paper sx={{ width: '100%', mb: 2 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User Info</TableCell>  
              <TableCell>Last Updated</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((data) => (
              <TableRow key={data._id}>
                <TableCell width="75%">
                  {data.name && `Name : ${data.name}`} <br />
                  {data.email && `Email : ${data.email}`}
                </TableCell>
                <TableCell>{formatDateTime(data.createdAt)}</TableCell>
                <TableCell>
                  <IconButton
                      color="primary"
                      aria-label="view details"
                      size="small"
                      onClick={() => handleClickOpen(data.sessionId)}
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
  );
};

export default HistoryTable;
