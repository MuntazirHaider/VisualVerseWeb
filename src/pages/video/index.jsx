import React, { useState } from 'react';
// @mui
import {
  Box,
  InputBase,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
// components
import FlexBetween from 'components/FlexBetween';
import WidgetWrapper from 'components/WidgetWrapper';
import UserChatWidget from 'widgets/UserChatWidget';
import VideoPlayerWidget from 'widgets/VideoPlayerWidget';
import SearchDrawer from 'components/SearchDrawer';
// icons
import {
  SearchRounded as SearchIcon,
} from '@mui/icons-material';
// state
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedVideoChat } from 'state';

const VideoChat = () => {
  const [drawerState, setDrawerState] = useState(false); /* for toggling search drawer */

  const friends = useSelector((state) => state.user.friends);
  const selectedVideoChat = useSelector((state) => state.selectedVideoChat);
  const onlineUsers = useSelector((state) => state.onlineUsers);

  const { palette } = useTheme();
  const dispatch = useDispatch();

  // colors
  const neutralLight = palette.neutral.light;

  const isNonMobScreens = useMediaQuery('(min-width: 1000px)');

  // functions to toggle search drawer
  const openDrawer = () => {
    setDrawerState(true);
  };

  const closeDrawer = () => {
    setDrawerState(false);
  };

  // function to select a user to video call
  const selectVideoChat = (chat) => {
    if (onlineUsers.includes(chat._id)) {
      dispatch(setSelectedVideoChat({ selectedVideoChat: chat }));
    }
  };

  return (
    <Box>
      <FlexBetween padding="2rem 6%">
        {/* User's list section */}
        {(isNonMobScreens || (!isNonMobScreens && !selectedVideoChat)) && (
          <WidgetWrapper padding="2rem 4%" height="86vh" flexBasis={isNonMobScreens ? '40%' : '100%'}>
            {/* Search bar */}
            <Box
              display="flex"
              alignItems="center"
              backgroundColor={neutralLight}
              borderRadius="9px"
              padding="0.3rem 0.5rem"
              sx={{ mr: 1, mb: '1.5rem' }}
              onClick={openDrawer}
            >
              <SearchIcon sx={{ mr: 1 }} />
              <InputBase placeholder="Search user..." fullWidth />
            </Box>
            {/* list all video chats */}
            <Box display="flex" flexDirection="column" gap="1rem">
              {friends && (
                <>
                  {friends?.map((videoChat) => {
                    const isOnline = onlineUsers.includes(videoChat._id);
                    return (
                      <Box
                        key={videoChat._id}
                        sx={{
                          '&:hover': { bgcolor: isOnline ? neutralLight : '' },
                          borderRadius: 1,
                          p: 0.5,
                          pr: 1.5,
                          bgcolor: selectedVideoChat?._id === videoChat._id ? neutralLight : '',
                          opacity: isOnline ? 1 : 0.5,
                          cursor: isOnline ? 'pointer' : 'not-allowed',
                        }}
                        onClick={() => isOnline && selectVideoChat(videoChat)}
                      >
                        <UserChatWidget
                          userId={videoChat._id}
                          picturePath={videoChat.picturePath}
                          name={`${videoChat.firstName} ${videoChat.middleName} ${videoChat.lastName}`}
                          isChatList
                        />
                      </Box>
                    );
                  })}
                </>
              )}
            </Box>
          </WidgetWrapper>
        )}

        {isNonMobScreens && <Box m={2} />}

        {/* video player section */}
        {!(!selectedVideoChat && !isNonMobScreens) && (
          <Box
            sx={{
              backgroundColor: palette.background.alt,
              borderRadius: '0.75rem',
              mt: 1,
            }}
            width="100%"
            height="86vh"
          >
            {selectedVideoChat && <VideoPlayerWidget />}
            <>
              {!selectedVideoChat && (
                <Box display="flex" justifyContent="center" alignItems="center" height={1}>
                  <Typography variant="h3">No user selected to call</Typography>
                </Box>
              )}
            </>
          </Box>
        )}
      </FlexBetween>
      {/* drawer for search */}
      <SearchDrawer onOpen={openDrawer} onClose={closeDrawer} drawerState={drawerState} isChatSearch chats={friends} />
    </Box>
  );
};

export default VideoChat;
