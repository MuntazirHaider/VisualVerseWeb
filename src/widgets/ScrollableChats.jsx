import { useState, useEffect, useRef } from 'react';
// @mui
import {
  Box,
  Chip,
  useTheme,
  Typography,
  Card,
  CardMedia,
  Link
} from '@mui/material';
// state
import { useSelector } from 'react-redux';
// utils
import ScrollableFeed from 'react-scrollable-feed';
import { formatDate, renderTime } from 'utils/DateUtils';
import { isLoggedInUser } from 'utils/ChatUtils';

const ScrollableChats = ({ messages }) => {

  const { _id } = useSelector((state) => state.user);
  const selectedChat = useSelector((state) => state.selectedChat);

  const [messagesByDate, setMessagesByDate] = useState({});

  const { palette } = useTheme();

  // colors
  const primaryMain = palette.primary.main;
  const mediumMain = palette.neutral.mediumMain;

  const bottomRef = useRef(null);

  useEffect(() => {
    const sortedMessages = {};

    messages.forEach((message) => {
      const msgDate = new Date(message.createdAt).toDateString();
      if (!sortedMessages[msgDate]) sortedMessages[msgDate] = [];

      sortedMessages[msgDate].push(message);
    });

    setMessagesByDate(sortedMessages);
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChat]);

  const renderMessageContent = (message) => {
    switch (message.contentType) {
      case 'image':
        return (
          <Box
            sx={{
              border: `1px solid ${isLoggedInUser(_id, message.sender._id) ? primaryMain : mediumMain}`,
              borderRadius: '14px',
              p: 1,
              mb: 1,
            }}
          >
            {message.chat.isGroupChat && !isLoggedInUser(_id, message.sender._id) && <Typography variant="body2" sx={{ fontWeight: 'bold', color: primaryMain }}>
              {`${message.sender.firstName} ${message.sender.middleName} ${message.sender.lastName}`}
            </Typography>}
            <Card>
              <CardMedia
                component="img"
                image={message.content}
                alt="uploaded-img"
                sx={{ maxWidth: '500px', borderRadius: '8px', maxHeight: '400px' }}
              />
            </Card>
            <Typography sx={{
              fontSize: 10,
              color: mediumMain,
              textAlign: 'right',
              pt: 1
            }}>
              {renderTime(message.createdAt)}
            </Typography>
          </Box>
        );
      case 'video':
        return (
          <Box
            sx={{
              border: `1px solid ${isLoggedInUser(_id, message.sender._id) ? primaryMain : mediumMain}`,
              borderRadius: '14px',
              p: 1,
              mb: 1,
            }}
          >
            {message.chat.isGroupChat && !isLoggedInUser(_id, message.sender._id) && <Typography variant="body2" sx={{ fontWeight: 'bold', color: primaryMain }}>
              {`${message.sender.firstName} ${message.sender.middleName} ${message.sender.lastName}`}
            </Typography>}
            <Card>
              <CardMedia
                component="video"
                controls
                src={message.content}
                sx={{ maxWidth: '500px', borderRadius: '8px', maxHeight: '400px' }}
              />
            </Card>
            <Typography sx={{
              fontSize: 10,
              color: mediumMain,
              textAlign: 'right',
              pt: 1
            }}>
              {renderTime(message.createdAt)}
            </Typography>
          </Box>
        );
      case 'audio':
        return (
          <Box
            sx={{
              border: `1px solid ${isLoggedInUser(_id, message.sender._id) ? primaryMain : mediumMain}`,
              borderRadius: '14px',
              p: 1,
              mb: 1,
            }}
          >
            {message.chat.isGroupChat && !isLoggedInUser(_id, message.sender._id) && <Typography variant="body2" sx={{ fontWeight: 'bold', color: primaryMain }}>
              {`${message.sender.firstName} ${message.sender.middleName} ${message.sender.lastName}`}
            </Typography>}
            <audio controls src={message.content} style={{ maxWidth: '100%' }} loop={true} />
            <Typography sx={{
              fontSize: 10,
              color: mediumMain,
              textAlign: 'right'
            }}>
              {renderTime(message.createdAt)}
            </Typography>
          </Box>
        );
      case 'document':
        return (
          <Box
            sx={{
              border: `1px solid ${isLoggedInUser(_id, message.sender._id) ? primaryMain : mediumMain}`,
              borderRadius: '14px',
              p: 1,
              mb: 1,
            }}
          >
            {message.chat.isGroupChat && !isLoggedInUser(_id, message.sender._id) && <Typography variant="body2" sx={{ fontWeight: 'bold', color: primaryMain }}>
              {`${message.sender.firstName} ${message.sender.middleName} ${message.sender.lastName}`}
            </Typography>}
            <Link href={message.content} target="_blank" rel="noopener noreferrer">
              <CardMedia
                component="img"
                image={process.env.REACT_APP_DEFAULT_DOCUMENT_IMAGE}
                alt="uploaded-img"
                sx={{ maxWidth: '100px', borderRadius: '8px', maxHeight: '100px' }}
              />
            </Link>
            <Typography sx={{
              fontSize: 10,
              color: mediumMain,
              textAlign: 'right'
            }}>
              {renderTime(message.createdAt)}
            </Typography>
          </Box>
        );
      case 'info':
        return (
          <Box textAlign="center" my={0.5}> 
            <Chip label={message.content} variant="filled" />
          </Box>
        )
      default:
        return (
          <Box
            sx={{
              border: `1px solid ${isLoggedInUser(_id, message.sender._id) ? primaryMain : mediumMain}`,
              borderRadius: '14px',
              maxWidth: '80%',
              wordWrap: 'break-word',
              whiteSpace: 'normal',
              p: 1,
              px: 2,
              fontSize: 12,
              mb: 1,
            }}
          >
            {message?.chat?.isGroupChat && !isLoggedInUser(_id, message.sender._id) && <Typography variant="body2" sx={{ fontWeight: 'bold', color: primaryMain }}>
              {`${message.sender.firstName} ${message.sender.middleName} ${message.sender.lastName}`}
            </Typography>}
            <Typography variant="subtitle2">
              {message.content}
            </Typography>
            <Typography sx={{
              fontSize: 10,
              color: mediumMain,
              textAlign: 'right'
            }}>
              {renderTime(message.createdAt)}
            </Typography>
          </Box>
        );
    }
  };

  return (
    <ScrollableFeed forceScroll={true}>
      {messagesByDate && Object.entries(messagesByDate).map(([date, messages]) => (
        <Box key={date}>
          <Box textAlign="center" my={2}>
            <Chip label={formatDate(date)} variant="filled" />
          </Box>
          {messages.map((m, i) => (
            <Box
              sx={{
                display: 'flex',
                justifyContent: m.contentType === 'info' ? 'center' : isLoggedInUser(_id, m.sender._id) ? 'flex-end' : 'flex-start',
                my: 2
              }}
              key={i}
            >
              {renderMessageContent(m)}
            </Box>
          ))}
        </Box>
      ))
      }
      <div ref={bottomRef} />
    </ScrollableFeed >
  );
};

export default ScrollableChats;
