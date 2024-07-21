import { useEffect, useState, memo } from 'react'
// mui
import { styled } from "@mui/system";
import {
  Box,
  IconButton,
  InputBase,
  Typography,
  MenuItem,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField,
  Button,
  SwipeableDrawer,
  Divider,
  AppBar,
  Toolbar,
  Menu,
  Container,
  Avatar,
  Tooltip,
  Badge
} from '@mui/material';
//icons
import {
  // NotificationsNoneRounded as NotificationsNoneIcon,
  Notifications,
  DarkModeRounded as DarkModeIcon,
  OndemandVideo,
  LightModeRounded as LightModeIcon,
  SearchRounded as SearchIcon,
  MessageRounded as MessageIcon,
  HelpRounded as HelpIcon,
  LogoutRounded as LogoutIcon,
  PersonOffRounded as DeleteAccountIcon,
  PersonRounded as ProfileIcon,
  VideoCallRounded as VideoIcon,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
// state
import { useDispatch, useSelector } from 'react-redux';
import { setMode, setLogout, setSelectedChat, setNotifications, setSelectedVideoChat } from "state";
import { useSocket } from 'context/SocketContext';
// route
import { useNavigate } from 'react-router-dom';
import RestApiClient from 'routes/RestApiClient';
import Apis from 'routes/apis';
// component
import FlexBetween from 'components/FlexBetween';
import UserChatWidget from 'widgets/UserChatWidget';
import SearchDrawer from 'components/SearchDrawer';
// utils
import { toast } from "react-toastify";
import { getSenderName, getSenderPicture } from 'utils/ChatUtils';
import { playNotification } from 'utils/SoundUtils';

// custom drawer header tag
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

function Navbar({ userId, picturePath }) {

  const [state, setState] = useState({ right: false });         // for mobile side menu drawer
  const [anchorElUser, setAnchorElUser] = useState(null);       // for avatar toggle menu
  const [anchorElNotification, setAnchorElNotification] = useState(null);  // for notification toggle menu
  const [open, setOpen] = useState(false);                                 // for delete confirmation modal
  const [confirmdeleteInput, setConfirmDeleteInput] = useState('');        // for delete confirmation modal
  const [drawerState, setDrawerState] = useState(false);                   // for search drawer
  const [arrangedNotifications, setArrangedNotifications] = useState({});  // for arranging same chat notifications 

  // functions to open avatar and notification list
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenNotificationMenu = (event) => {
    setAnchorElNotification(event.currentTarget);
  };

  const handleCloseNotificationMenu = () => {
    setAnchorElNotification(null);
  };

  const token = useSelector((state) => state.token);
  const notifications = useSelector((state) => state.notifications);
  const { socket, disconnectSocket } = useSocket();
  const selectedChat = useSelector((state) => state.selectedChat);

  const theme = useTheme();
  const { palette } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const api = new RestApiClient(token);

  const isNonMobScreens = useMediaQuery("(min-width: 1000px)");

  // colors
  const neutralLight = theme.palette.neutral.light;
  const dark = theme.palette.neutral.dark;
  const primaryLight = theme.palette.primary.light;
  const primaryMain = theme.palette.primary.main;
  const backgroundAlt = theme.palette.background.alt;


  // go to profile page 
  const getProfile = async () => {
    navigate(`/profile/${userId}`);
  }

  //  function to toggle search drawer
  const openDrawer = () => {
    setDrawerState(true);
  };

  const closeDrawer = () => {
    setDrawerState(false);
  };

  const toggleDrawer = (anchor, open) => () => {
    setState({ ...state, [anchor]: open });
  };

  // function to open and close account delete confirmation mmodal
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setConfirmDeleteInput('')
    setOpen(false);
  };

  // function to logout
  const handleLogout = () => {
    dispatch(setLogout());
    navigate("/");
    disconnectSocket();
  }


  //  function to delete account
  const handledeleteAccount = async () => {
    if (confirmdeleteInput.trim() !== 'delete')
      return toast.error("Please type 'delete' to confirm account deletion.");
    setConfirmDeleteInput('');
    try {
      const response = await api.delete(`${Apis.user.index}/${userId}/delete`);
      if (response.result) {
        dispatch(setLogout());
        navigate("/login");
        disconnectSocket();
        toast.success("Account Removed Successfully!");
      } else {
        toast.error("Unable To Remove Account");
      }
    } catch (error) {
      console.error('Error in deleting user:', error);
    }
  }

  // function to back to home
  const handleRedirectHome = () => {
    navigate("/home");
    dispatch(setSelectedChat({ selectedChat: null }));
    dispatch(setSelectedVideoChat({ selectedVideoChat: null }));
  }

  // const fetchAllNotifications = async () => {
  //   const response = await api.get(Apis.notifications.index);
  //   if (response.result) {
  //     dispatch(setNotifications({ notifications: response.data }));
  //   }
  // }

  // function to create a new notification
  const handleCreateNotification = async (newMessage) => {
    const body = {
      "chatId": newMessage.chat._id,
      "messageId": newMessage._id
    }
    const response = await api.post(Apis.notifications.index, body);
    if (response.result) {
      dispatch(setNotifications({ notifications: [response.data, ...notifications] }));
    }
  }

  // function to redirect to notified chat
  const handleNotificationClick = async (chat) => {
    dispatch(setSelectedChat({ selectedChat: chat }));
    navigate("/chats")
    handleCloseNotificationMenu();
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

  //  function to clear all notifications
  const handleClearAllNotifications = async () => {
    handleCloseNotificationMenu();
    const response = await api.delete(Apis.notifications.index);
    if (response.result) {
      dispatch(setNotifications({ notifications: [] }));
    }
  }

  // arrange all notifications chat wise 
  useEffect(() => {
    const newArrangedNotifications = {};

    notifications.forEach((noti) => {
      const { notificationChat } = noti;
      if (!newArrangedNotifications[notificationChat._id]) {
        newArrangedNotifications[notificationChat._id] = [];
      }
      newArrangedNotifications[notificationChat._id].push(noti);
    });

    setArrangedNotifications(newArrangedNotifications);
  }, [notifications]);

  useEffect(() => {
    if (socket) {
      socket.on("chats: new message received", (newMessage) => {
        if (selectedChat === null || selectedChat._id !== newMessage.chat._id) {
          if (!notifications.includes(newMessage)) {
            handleCreateNotification(newMessage)
          }
          playNotification();
        }
      });

      return () => {
        socket.off("chats: new message received")
      }
    }
  });

  // useEffect(() => {
  //   fetchAllNotifications()
  // }, [])


  return (
    <AppBar position='sticky'>
      <Container maxWidth="true">
        <Toolbar disableGutters sx={{ display: 'flex', flexWrap: 'nowrap' }}>
          {/* LOGO AND SEARCH BAR */}
          <FlexBetween flexGrow="1">
            <FlexBetween gap={2}>
              {isNonMobScreens ? (
                <Typography
                  fontWeight="bold"
                  fontSize="1.5em"
                  color="neutralLight"
                  onClick={handleRedirectHome}
                  sx={{
                    "&:hover": {
                      color: primaryLight,
                      cursor: "pointer",
                    },
                  }}
                >
                  VisualVerse
                </Typography>
              ) :
                <IconButton onClick={handleRedirectHome}>
                  <Avatar sx={{ bgcolor: backgroundAlt }}>
                    <OndemandVideo sx={{ fontWeight: "bold", fontSize: "1.5rem", color: dark }} />
                  </Avatar>
                </IconButton>
              }
              <FlexBetween backgroundColor={neutralLight} borderRadius="9px" gap="3rem" padding="0.1rem 0.2rem" onClick={openDrawer}>
                <InputBase placeholder='Search...' sx={{
                  width: 1,
                  '@media (max-width: 520px)': {
                    // visibility: 'hidden'
                    display: 'none'
                  }
                }} />
                <IconButton>
                  <SearchIcon />
                </IconButton>
              </FlexBetween>
            </FlexBetween>
          </FlexBetween>

          {/* DESKTOP SETTING */}
          {isNonMobScreens ?
            <>
              {/*  menu options */}
              <Box sx={{ justifyContent: 'flex-end', alignItems: 'center', width: '70%', display: 'flex' }}>
                <FlexBetween gap="1rem">

                  {/* theme mode icon */}
                  <Tooltip title="Theme">
                    <IconButton onClick={() => dispatch(setMode())}>
                      {theme.palette.mode === "dark" ? (
                        <LightModeIcon sx={{ fontSize: "25px" }} />
                      ) : (
                        <DarkModeIcon sx={{ color: dark, fontSize: "25px" }} />
                      )}
                    </IconButton>
                  </Tooltip>

                  {/* chat icon */}
                  <Tooltip title="Chats">
                    <IconButton onClick={() => navigate("/chats")}>
                      <MessageIcon sx={{ color: dark, fontSize: "25px" }} />
                    </IconButton>
                  </Tooltip>

                  {/* video call icon */}
                  <Tooltip title="Video Call">
                    <IconButton onClick={() => navigate('/video-call')}>
                      <VideoIcon sx={{ color: dark, fontSize: "25px" }} />
                    </IconButton>
                  </Tooltip>

                  {/* notification icon */}
                  <Tooltip title="Notifications">
                    <IconButton onClick={handleOpenNotificationMenu}>
                      <Badge badgeContent={notifications.length} color="error" overlap="circular">
                        <Notifications sx={{ color: dark, fontSize: "25px" }} />
                      </Badge>
                    </IconButton>
                  </Tooltip>

                  {/* list of notifications  */}


                  {/* Help icon */}
                  <Tooltip title="Help">
                    <IconButton onClick={() => navigate("/help")}>
                      <HelpIcon sx={{ color: dark, fontSize: "25px" }} />
                    </IconButton>
                  </Tooltip>

                </FlexBetween>

                {/*  Avatar */}
                <Box sx={{ ml: 3 }}>
                  <Tooltip title="Open profile settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar alt="Account " src={picturePath} sx={{ width: 46, height: 46 }} />
                    </IconButton>
                  </Tooltip>
                  {/* list of user options */}
                  <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >

                    <MenuItem onClick={getProfile}>
                      <ProfileIcon sx={{ fontSize: "20px", mr: 1 }} />
                      Profile
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <LogoutIcon sx={{ fontSize: "20px", mr: 1 }} />
                      Logout
                    </MenuItem>
                    <MenuItem onClick={handleClickOpen}>
                      <DeleteAccountIcon sx={{ fontSize: "20px", mr: 1 }} />
                      Delete Account
                    </MenuItem>
                  </Menu>
                </Box>
              </Box>
            </>
            :
            //  Mobile Settings 

            // Avatar With Drawer
            <Box sx={{ display: 'flex', flexDirection: 'row-reverse', width: '60%', alignItems: 'center', flexBasis: '0', flexGrow: '1' }}>
              <Tooltip title="Options" >
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="end"
                  onClick={toggleDrawer('right', true)}
                  sx={{ ...(open && { display: 'none' }), display: '' }}
                >

                  <Avatar alt="Account " src={picturePath} sx={{ width: 46, height: 46 }} />
                </IconButton>
              </Tooltip>

              {/* Notification icon */}
              <Tooltip title="Notifications">
                <IconButton onClick={handleOpenNotificationMenu}>
                  <Badge badgeContent={notifications.length} color="error" overlap="circular">
                    <Notifications sx={{ color: dark, fontSize: "25px" }} />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Drawer for options */}
              <SwipeableDrawer
                sx={{
                  width: 240,
                  flexShrink: 0,
                  '& .MuiDrawer-paper': {
                    width: 240,
                  },
                }}
                anchor="right"
                open={state['right']}
                onClose={toggleDrawer('right', false)}
                onOpen={toggleDrawer('right', true)}
              >
                {/* Drawer header */}
                <DrawerHeader>
                  {/* toggle drawer icon */}
                  <IconButton onClick={toggleDrawer('right', false)}>
                    {theme.direction === 'rtl' ? <ChevronLeft /> : <ChevronRight />}
                  </IconButton>

                  <Typography
                    fontWeight="bold"
                    fontSize="1.5em"
                    color="neutralLight"
                    onClick={() => { handleRedirectHome(); toggleDrawer('right', false)(); }}
                    sx={{
                      "&:hover": {
                        color: primaryLight,
                        cursor: "pointer",
                      },
                    }}
                  >
                    VisualVerse
                  </Typography>
                </DrawerHeader>

                <Divider />

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>

                  {/* profile icon */}
                  <IconButton onClick={() => { getProfile(); toggleDrawer('right', false)(); }}>
                    <ProfileIcon sx={{ color: dark, fontSize: "25px", mr: 1 }} />
                    Profile
                  </IconButton>

                  <Divider />

                  {/* theme icon */}
                  <IconButton onClick={() => { dispatch(setMode()); toggleDrawer('right', false)(); }}>
                    {theme.palette.mode === "dark" ? (
                      <LightModeIcon sx={{ fontSize: "25px", mr: 1 }} />
                    ) : (
                      <DarkModeIcon sx={{ color: dark, fontSize: "25px", mr: 1 }} />
                    )}
                    Theme
                  </IconButton>


                  {/* chat icon */}
                  <IconButton onClick={() => { navigate("/chats"); toggleDrawer('right', false)(); }}>
                    <MessageIcon sx={{ color: dark, fontSize: "25px", mr: 1 }} />
                    Chat
                  </IconButton>

                  {/* video call icon */}
                  <IconButton onClick={() => { navigate("/video-call"); toggleDrawer('right', false)(); }}>
                    <VideoIcon sx={{ color: dark, fontSize: "25px", mr: 1 }} />
                    Video Call
                  </IconButton>

                  {/* help icon */}
                  <IconButton onClick={() => { navigate("/help"); toggleDrawer('right', false)(); }}>
                    <HelpIcon sx={{ color: dark, fontSize: "25px", mr: 1 }} />
                    Help
                  </IconButton>

                  <br />
                  <hr width="100%" />

                  {/* account options */}
                  <IconButton onClick={handleLogout}><LogoutIcon sx={{ color: dark, fontSize: "25px", mr: 1 }} />Log Out</IconButton>
                  <IconButton onClick={handleClickOpen}><DeleteAccountIcon sx={{ color: dark, fontSize: "25px", mr: 1 }} />Delete Account</IconButton>
                </Box>
              </SwipeableDrawer>
            </Box>
          }

          <Menu
            sx={{ mt: '45px', width: '100%' }}
            id="menu-appbar"
            anchorEl={anchorElNotification}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElNotification)}
            onClose={handleCloseNotificationMenu}
          >
            {notifications.length > 0 ? (
              <div>
                {Object.keys(arrangedNotifications).map(chatId => (
                  <MenuItem onClick={() => handleNotificationClick(arrangedNotifications[chatId][0].notificationChat)} key={chatId}>
                    {arrangedNotifications[chatId][0].notificationChat.isGroupChat ? (
                      <div>
                        <UserChatWidget
                          name={arrangedNotifications[chatId][0].notificationChat.chatName}
                          picturePath={arrangedNotifications[chatId][0].notificationChat.groupPicture}
                          lastMessage={`${arrangedNotifications[chatId].length} unread messages`}
                        />
                      </div>
                    ) : (
                      <div>
                        <UserChatWidget
                          name={getSenderName(userId, arrangedNotifications[chatId][0].notificationChat.users)}
                          picturePath={getSenderPicture(userId, arrangedNotifications[chatId][0].notificationChat.users)}
                          lastMessage={`${arrangedNotifications[chatId].length} unread messages`}
                        />
                      </div>
                    )}
                  </MenuItem>
                ))}
                <MenuItem sx={{ justifyContent: 'center' }}>
                  <Button
                    sx={{
                      backgroundColor: primaryMain,
                      color: backgroundAlt,
                      cursor: 'pointer',
                      "&:hover": { color: primaryMain },
                      width: '100%',
                      textAlign: 'center'
                    }}
                    onClick={handleClearAllNotifications}
                  >
                    Mark All As Read
                  </Button>
                </MenuItem>
              </div>
            ) : (
              <MenuItem>
                No Notifications
              </MenuItem>
            )}
          </Menu>

          {/* pop up modal for delete confirmation */}
          <Dialog
            open={open}
            onClose={handleClose}
            maxWidth='sm'
            fullWidth
            PaperProps={{
              component: 'form',
              onSubmit: (event) => {
                event.preventDefault();
                handledeleteAccount();
              },
            }}
          >
            <DialogTitle>Confirm Your Action</DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ display: 'flex' }}>
                Please type " delete " to confirm account deletion.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                label="Type Delete"
                fullWidth
                onChange={(e) => setConfirmDeleteInput(e.target.value)}
                value={confirmdeleteInput}
                variant="standard"
              />
            </DialogContent>
            <DialogActions sx={{ pb: 2, pr: 2 }}>
              <Button
                sx={{
                  backgroundColor: '#ff3333',
                  color: palette.background.alt,
                  borderRadius: "3rem",
                  "&:hover": { color: '#ff3333' },
                  width: '15%',
                  height: '15%'
                }}
                onClick={handleClose}>
                Cancel
              </Button>
              <Button
                sx={{
                  backgroundColor: palette.primary.main,
                  color: palette.background.alt,
                  borderRadius: "3rem",
                  "&:hover": { color: palette.primary.main },
                  width: '15%',
                  height: '15%'
                }}
                type="submit"
              >
                Confirm
              </Button>
            </DialogActions>
          </Dialog>

        </Toolbar>
        {/* drawer for search */}
        <SearchDrawer onOpen={openDrawer} onClose={closeDrawer} drawerState={drawerState} />

      </Container>
    </AppBar >


  );
}
export default memo(Navbar);