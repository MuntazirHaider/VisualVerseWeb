import { Box, Chip, useTheme, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import ScrollableFeed from 'react-scrollable-feed';
import { formatDate, isLoggedInUser, renderTime } from 'utils/ChatUtils';

const ScrollableChats = ({ messages }) => {
  const theme = useTheme();

  const primaryMain = theme.palette.primary.main;
  const medium = theme.palette.neutral.medium;
  const neutralLight = theme.palette.neutral.light;

  const user = useSelector((state) => state.user);

  const messagesByDate = {};
  messages.forEach((message) => {
    const msgDate = new Date(message.createdAt).toDateString();
    if (!messagesByDate[msgDate]) messagesByDate[msgDate] = [];

    messagesByDate[msgDate].push(message);
  })

  return (
    <ScrollableFeed forceScroll={true}>
      {/* {messages && messages.map((m, i) => (
        <Box sx={{ display: 'flex', justifyContent: isLoggedInUser(user._id, m.sender._id) ? 'flex-end' : 'flex-start', my: 1 }}>
          <Chip key={i} sx={{
            backgroundColor: isLoggedInUser(user._id, m.sender._id) ? primaryMain : '', maxWidth: '80%',
            wordWrap: 'break-word',
            '& .MuiChip-label': {
              whiteSpace: 'normal',
            },
            height: 'auto',
            p: 1,
            fontSize: 12
          }} label={m.content} />
        </Box>
      ))} */}
      {messagesByDate && Object.entries(messagesByDate).map(([date, message]) => (
        <Box key={date}>

          <Box textAlign="center" my={2}>
            <Chip label={formatDate(date)} variant="filled" />
          </Box>
          {message.map((m, i) => (
            <Box sx={{ display: 'flex', justifyContent: isLoggedInUser(user._id, m.sender._id) ? 'flex-end' : 'flex-start', my: 1 }} key={i}>
              <Chip variant='outlined' sx={{
                // backgroundColor: isLoggedInUser(user._id, m.sender._id) ? primaryMain : '',
                borderColor: isLoggedInUser(user._id, m.sender._id) ? primaryMain : '',
                maxWidth: '80%',
                wordWrap: 'break-word',
                '& .MuiChip-label': {
                  whiteSpace: 'normal',
                },
                height: 'auto',
                p: 1,
                fontSize: 12
              }} label={m.content} />
              <Typography sx={{ fontSize: 10, color: neutralLight, mt: 2.5 }}>
                {renderTime(m.createdAt)}
              </Typography>
            </Box>
          ))}
        </Box>
      ))}

    </ScrollableFeed>
  );
};

export default ScrollableChats;