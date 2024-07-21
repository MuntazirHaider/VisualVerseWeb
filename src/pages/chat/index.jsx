import { React, useState, useEffect } from 'react'
// @mui
import {
  Box,
  useMediaQuery,
  useTheme,
  InputBase,
  Button,
} from '@mui/material';
// states
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from 'context/SocketContext';
import { setChats, setNotifications, setSelectedChat } from 'state';
// component
import FlexBetween from 'components/FlexBetween';
import WidgetWrapper from "components/WidgetWrapper";
import UserChatWidget from 'widgets/UserChatWidget';
import AddGroupModalWidget from 'widgets/AddGoupModalWidget';
import SearchDrawer from 'components/SearchDrawer';
import SingleChat from '../../widgets/SingleChat';
// routes
import Apis from "routes/apis";
import RestApiClient from 'routes/RestApiClient';
// icons
import {
  SearchRounded as SearchIcon,
  AddRounded as AddIcon,
} from '@mui/icons-material';
// utils
import { toast } from "react-toastify";
import { getSenderId, getSenderName, getSenderPicture } from 'utils/ChatUtils';

const Chat = () => {

  const { _id } = useSelector((state) => state.user);
  const chats = useSelector((state) => state.chats);                 /* chats name */
  const token = useSelector((state) => state.token);
  const selectedChat = useSelector((state) => state.selectedChat);
  const notifications = useSelector((state) => state.notifications);

  const [openAddGroupDialog, setOpenAddGroupDialog] = useState(false);   /* for toggling group modal */
  const [drawerState, setDrawerState] = useState(false);                 /* for toggling search drawer */
  const [isChatsUpdated, setIsChatsUpdated] = useState(false);           /* flag for comapring old and new chat */
  const [arrangedNotifications, setArrangedNotifications] = useState({}); /* storing notification chatwise */

  const { socket } = useSocket();
  const theme = useTheme();
  const dispatch = useDispatch();
  const api = new RestApiClient(token);
  const isNonMobScreens = useMediaQuery("(min-width: 1000px)");

  // colors
  const neutralLight = theme.palette.neutral.light;
  const primaryMain = theme.palette.primary.main;
  const backgroundAlt = theme.palette.background.alt;

  // function to toggle group modal and search drawer
  const handleClickOpen = () => {
    setOpenAddGroupDialog(true);
  };

  const handleClose = () => {
    setOpenAddGroupDialog(false);
  };

  const openDrawer = () => {
    setDrawerState(true);
  };

  const closeDrawer = () => {
    setDrawerState(false);
  };

  // function to select particular chat
  const selectChat = (chat) => {
    if (notifications.length > 0) {
      for (let i = 0; i < notifications.length; i++) {
        const noti = notifications[i];
        const { notificationChat } = noti;
        if (notificationChat._id === chat._id) {
          handleNotificationClick(chat);
          break;
        }
      }
    }
    dispatch(setSelectedChat({ selectedChat: chat }));
  }

  // function to redirect to notified chat
  const handleNotificationClick = async (chat) => {
    const body = {
      chatId: chat._id
    }
    const response = await api.delete(Apis.notifications.index, body);
    if (response.result) {
      const result = await api.get(Apis.notifications.index);
      if (result.result) {
        dispatch(setNotifications({ notifications: result.data }));
      }
    }
  }

  // get all chats for logged in user
  const fetchChats = async () => {
    try {
      const response = await api.get(Apis.chats.index);
      if (response.result) {
        const sortedChats = response.data.sort((a, b) => {
          if (!a.latestMessage || !b.latestMessage) return 0; // Handle cases where there might not be a latestMessage
          return new Date(b.latestMessage.createdAt) - new Date(a.latestMessage.createdAt);
        });
        dispatch(setChats({ chats: sortedChats }));
        handleUpdateNotification();
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong, Please try again");
    }
  }

  // function to indicate when chat updated(send as a prop)
  const handleChatsUpdate = () => {
    setIsChatsUpdated(true);
  };

  // arrange all notifications chat wise 
  const handleUpdateNotification = () => {
    const newArrangedNotifications = {};

    notifications.forEach((noti) => {
      const { notificationChat } = noti;
      if (!newArrangedNotifications[notificationChat._id]) {
        newArrangedNotifications[notificationChat._id] = [];
      }
      newArrangedNotifications[notificationChat._id].push(noti);
    });

    setArrangedNotifications(newArrangedNotifications);
  }

  useEffect(() => {
    handleChatsUpdate();
    // eslint-disable-next-line
  }, [notifications])

  useEffect(() => {
    if (socket) {
      socket.on('chats: new group chats joined', () => {
        handleChatsUpdate();
      });

      socket.on('chats: group chat updated', (updatedGroup) => {
        // if group chat active
        if (selectedChat?._id === updatedGroup._id) {
          // if you are removed by group admin
          if (updatedGroup.users.every((u) => u._id !== _id)) {
            dispatch(setSelectedChat({ selectedChat: null }));
          } else {
            // if group setting upgraded
            dispatch(setSelectedChat({ selectedChat: updatedGroup }));
          }
        }
        handleChatsUpdate();
      })
    }
  });

  useEffect(() => {
    if (isChatsUpdated) {
      fetchChats();
      setIsChatsUpdated(false);
    }
    // eslint-disable-next-line
  }, [isChatsUpdated])

  return (
    <Box>
      <FlexBetween padding="2rem 6%">
        {/* User's List Section*/}
        {(isNonMobScreens || (!isNonMobScreens && !selectedChat)) && <WidgetWrapper
          padding="2rem 4%"
          height='86vh'
          flexBasis={isNonMobScreens ? '40%' : '100%'}
        >
          <FlexBetween mb="1.5rem">
            {/* Search button for drawer*/}
            <Box display="flex" alignItems="center" backgroundColor={neutralLight} borderRadius="9px" padding="0.3rem 0.5rem" sx={{ mr: 1 }} onClick={openDrawer}>
              <SearchIcon sx={{ mr: 1 }} />
              <InputBase placeholder='Search user...' sx={{ width: '90%' }} />
            </Box>

            {/* Add Group Button */}
            <Button
              sx={{
                backgroundColor: primaryMain,
                color: backgroundAlt,
                cursor: 'pointer',
                "&:hover": { color: primaryMain },
              }}
              onClick={handleClickOpen}
            >
              Group <AddIcon />
            </Button>

          </FlexBetween>
          {/* Users list with chat access */}
          <Box display="flex" flexDirection="column" gap="1rem">
            {chats && <>
              {/* list all chats */}
              {chats.map((chat) => {
                return <Box
                  key={chat._id}
                  sx={{
                    '&:hover': { bgcolor: neutralLight },
                    borderRadius: 1,
                    p: 0.5,
                    pr: 1.5,
                    bgcolor: selectedChat?._id === chat._id ? neutralLight : '',
                  }}
                  onClick={() => selectChat(chat)}
                >
                  {/* interface for each chat */}
                  <UserChatWidget userId={!chat.isGroupChat ? getSenderId(_id, chat.users) : '-1'} name={chat.isGroupChat ? chat.chatName : getSenderName(_id, chat?.users)} picturePath={chat.isGroupChat ? chat.groupPicture : getSenderPicture(_id, chat?.users)} lastMessage={chat.latestMessage?.content} lastMessageType={chat.latestMessage?.contentType} isChatList notification={arrangedNotifications[chat._id] && arrangedNotifications[chat._id].length} />


                </Box>
              })}
            </>}
          </Box>
        </WidgetWrapper>}

        {isNonMobScreens && <Box m={2} />}

        {/*Specific User Chat Section*/}
        {!(!selectedChat && !isNonMobScreens) &&
          <Box sx={{
            backgroundColor: theme.palette.background.alt,
            borderRadius: "0.75rem",
            mt: 1
          }}
            width='100%'
            height='86vh'
          >

            <SingleChat userId={_id} chats={chats} handleChatsUpdate={handleChatsUpdate} />
          </Box>
        }

      </FlexBetween >

      {/* modal for add group */}
      < AddGroupModalWidget onClose={handleClose} open={openAddGroupDialog} chats={chats} />

      {/* drawer for search */}
      < SearchDrawer onOpen={openDrawer} onClose={closeDrawer} drawerState={drawerState} isChatSearch chats={chats} />
    </Box >

  )
}

export default Chat