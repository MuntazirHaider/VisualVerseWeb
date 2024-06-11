import { React, useState, useEffect } from 'react'
// @mui
import {
  Box,
  useMediaQuery,
  useTheme,
  InputBase,
  Button,
  Typography
} from '@mui/material';
// redux
import { useDispatch, useSelector } from "react-redux";
import { setChats, setSelectedChat } from 'state';
// component
import FlexBetween from 'components/FlexBetween';
import WidgetWrapper from "components/WidgetWrapper";
// routes
import Apis from "routes/apis";
import RestApiClient from 'routes/RestApiClient';
// icons
import {
  SearchRounded as SearchIcon,
  AddRounded as AddIcon,
} from '@mui/icons-material';
// pages
import UserChatWidget from 'widgets/UserChatWidget';
import Navbar from 'pages/navbar';
import AddGroupModalWidget from 'widgets/AddGoupModalWidget';
import SearchDrawer from 'widgets/SearchDrawer';
import SingleChat from '../../widgets/SingleChat';
// utils
import { toast } from "react-toastify";
import { getSenderName, getSenderPicture } from 'utils/ChatUtils';

const Chat = () => {

  const token = useSelector((state) => state.token);
  const theme = useTheme();
  const api = new RestApiClient(token);
  const dispatch = useDispatch();

  const neutralLight = theme.palette.neutral.light;
  const primaryMain = theme.palette.primary.main;
  const backgroundAlt = theme.palette.background.alt;
  const { _id, picturePath } = useSelector((state) => state.user);
  const chats = useSelector((state) => state.chats);
  const selectedChat = useSelector((state) => state.selectedChat);
  const isNonMobScreens = useMediaQuery("(min-width: 1000px)");

  const [openAddGroupDialog, setOpenAddGroupDialog] = useState(false);
  const [drawerState, setDrawerState] = useState(false);

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

  const selectChat = (chat) => {
    dispatch(setSelectedChat({ selectedChat: chat }));
  }

  const fetchChats = async () => {
    try {
      const response = await api.get(Apis.chats.index);
      if (response.result) {
        dispatch(setChats({ chats: response.data }));
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong, Please try again");
    }
  }

  useEffect(() => {
    fetchChats();
    // eslint-disable-next-line
  }, [])

  return (
    <Box>
      <Navbar userId={_id} picturePath={picturePath} />
      <FlexBetween padding="2rem 6%">
        {/* User's List Section*/}
        {(isNonMobScreens || (!isNonMobScreens && !selectedChat)) && <WidgetWrapper
          padding="2rem 4%"
          height='86vh'
          flexBasis={isNonMobScreens ? '40%' : '100%'}
        >
          <FlexBetween mb="1.5rem">
            {/* Search button for drawer*/}
            <Box display="flex" alignItems="center" backgroundColor={neutralLight} borderRadius="9px" padding="0.3rem 0.5rem" sx={{mr: 1}} onClick={openDrawer}>
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

            {/* Users list with chat access */}
          </FlexBetween>
          <Box display="flex" flexDirection="column" gap="1rem">
            {chats && <>
              {chats.map((chat) => {
                return <Box
                  key={chat._id}
                  sx={{
                    '&:hover': { bgcolor: neutralLight },
                    borderRadius: 1,
                    p: 0.5,
                    bgcolor: selectedChat?._id === chat._id ? neutralLight : '',
                  }}
                  onClick={() => selectChat(chat)}
                >
                  <UserChatWidget name={chat.isGroupChat ? chat.chatName : getSenderName(_id, chat?.users)} picturePath={chat.isGroupChat ? chat.groupPicture : getSenderPicture(_id, chat?.users)} lastMessage={chat.latestMessage?.content} isChatList />
                </Box>
              })}
            </>}
          </Box>
        </WidgetWrapper>}

        {/*Specific User Chat Section*/}
        {!(!selectedChat && !isNonMobScreens) &&
          <WidgetWrapper
            width='100%'
            ml="2rem"
            height='86vh'
          >
            <SingleChat userId={_id} />
          </WidgetWrapper>
        }

      </FlexBetween>

      {/* modal for add group */}
      <AddGroupModalWidget onClose={handleClose} open={openAddGroupDialog} />

      {/* drawer for search */}
      <SearchDrawer onOpen={openDrawer} onClose={closeDrawer} drawerState={drawerState} isChatSearch />
    </Box>

  )
}

export default Chat