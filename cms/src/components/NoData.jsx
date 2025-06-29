// src/components/NoData.js
import { Box, Typography } from '@mui/material';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import NoRecord from "../assets/no-record.jpg"

const NoData = ({ message }) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="200px"
      flexDirection="column"
      sx={{ color: 'grey.600' }}
      style={{marginTop: "125px"}}
    >
        <img src={NoRecord} alt='no record found' style={{maxWidth: "400px"}} />
        <Typography variant="h6">{message}</Typography>
    </Box>
  );
};

export default NoData;
