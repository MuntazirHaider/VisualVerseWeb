import { useEffect, useState } from 'react'
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
  Drawer,
  Divider,
  AppBar,
  Toolbar,
  Menu,
  Container,
  Avatar,
  Tooltip,
  Badge
} from '@mui/material';
import {
  // NotificationsNoneRounded as NotificationsNoneIcon,
  Notifications,
  DarkModeRounded as DarkModeIcon,
  LightModeRounded as LightModeIcon,
  SearchRounded as SearchIcon,
  MessageRounded as MessageIcon,
  HelpRounded as HelpIcon,
  LogoutRounded as LogoutIcon,
  PersonOffRounded as DeleteAccountIcon,
  PersonRounded as ProfileIcon,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';
// state
import { useDispatch, useSelector } from 'react-redux';
import { setMode, setLogout, setSelectedChat, setNotifications } from "state";
// route
import { useNavigate } from 'react-router-dom';
import RestApiClient from 'routes/RestApiClient';
import Apis from 'routes/apis';
// component
import FlexBetween from 'components/FlexBetween';
// utils
import { toast } from "react-toastify";
import SearchDrawer from 'widgets/SearchDrawer';
import { getSenderName, getSenderPicture } from 'utils/ChatUtils';
import UserImage from 'components/UserImage';
import UserChatWidget from 'widgets/UserChatWidget';


const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

function Navbar({ userId, picturePath }) {
  const [state, setState] = useState({ right: false });
  const [display, setDisplay] = useState('');
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotification, setAnchorElNotification] = useState(null);

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
  const { palette } = useTheme();
  const token = useSelector((state) => state.token);
  const notifications = useSelector((state) => state.notifications);

  const [open, setOpen] = useState(false);
  const [confirmdeleteInput, setConfirmDeleteInput] = useState('');
  const [drawerState, setDrawerState] = useState(false);
  const [arrangedNotifications, setArrangedNotifications] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isNonMobScreens = useMediaQuery("(min-width: 1000px)");
  const selectedChat = useSelector((state) => state.selectedChat);

  const theme = useTheme();
  const neutralLight = theme.palette.neutral.light;
  const dark = theme.palette.neutral.dark;
  const primaryLight = theme.palette.primary.light;
  const primaryMain = theme.palette.primary.main;
  const backgroundAlt = theme.palette.background.alt;

  const api = new RestApiClient(token);

  // go to profile page 
  const getProfile = async () => {
    navigate(`/profile/${userId}`);
  }

  const openDrawer = () => {
    setDrawerState(true);
  };

  const closeDrawer = () => {
    setDrawerState(false);
  };

  const toggleDrawer = (anchor, open) => (event) => {
    setDisplay(display === '' ? 'none' : '');
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };


  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setConfirmDeleteInput('')
    setOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (confirmdeleteInput.trim() === 'delete') {
      await handledeleteAccount();
    } else {
      toast.error("Please type 'delete' to confirm account deletion.");
    }
    setConfirmDeleteInput('');
  };

  const handledeleteAccount = async () => {
    try {
      const response = await api.delete(`${Apis.user.index}/${userId}/delete`);
      if (response.result) {
        dispatch(setLogout());
        navigate("/");
        toast.success("Account Removed Successfully!");
      } else {
        toast.error("Unable To Remove Account");
      }
    } catch (error) {
      console.error('Error in deleting user:', error);
    }
  }

  const handleRedirectHome = () => {
    navigate("/home");
    dispatch(setSelectedChat({ selectedChat: null }));
  }

  // const fetchNotifications = async () => {
  //   const response = await api.get(Apis.notifications.index);
  //   if (response.result) {
  //     dispatch(setNotifications({ notifications: response.data }));
  //   }
  // }

  const handleNotificationClick = async (chat) => {
    dispatch(setSelectedChat({ selectedChat: chat }));
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

  const handleClearAllNotifications = async () => {
    handleCloseNotificationMenu();
    const response = await api.delete(Apis.notifications.index);
    if (response.result) {
      dispatch(setNotifications({ notifications: [] }));
    }
  }

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

  console.log(notifications);
  return (
    <AppBar position="static">
      <Container maxWidth="false">
        <Toolbar disableGutters>
          {/* LOGO AND SEARCH BAR */}
          <FlexBetween gap="1.75rem">
            {isNonMobScreens && (
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
            )}
            <FlexBetween backgroundColor={neutralLight} borderRadius="9px" gap="3rem" padding="0.1rem 0.5rem" onClick={openDrawer}>
              <InputBase placeholder='Search...' sx={{ width: 1 }} />
              <IconButton>
                <SearchIcon />
              </IconButton>
            </FlexBetween>
          </FlexBetween>

          {/* DESKTOP SETTING */}
          {isNonMobScreens ?
            <>
              {/*  menu options */}
              <Box sx={{ justifyContent: 'flex-end', alignItems: 'center', width: '70%', display: { xs: 'none', md: 'flex' } }}>
                <FlexBetween gap="1rem">
                  <Tooltip title="Theme"><IconButton onClick={() => dispatch(setMode())}>
                    {theme.palette.mode === "dark" ? (
                      <LightModeIcon sx={{ fontSize: "25px" }} />
                    ) : (
                      <DarkModeIcon sx={{ color: dark, fontSize: "25px" }} />
                    )}
                  </IconButton></Tooltip>
                  <Tooltip title="Chats"><IconButton> <MessageIcon sx={{ color: dark, fontSize: "25px" }} /></IconButton></Tooltip>
                  {/* notification */}
                  <Tooltip title="Notifications">
                    <IconButton onClick={handleOpenNotificationMenu}>
                      <Badge badgeContent={notifications.length} color="error" overlap="circular">
                        <Notifications sx={{ color: dark, fontSize: "25px" }} />
                      </Badge>
                    </IconButton>
                  </Tooltip>
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
                      <>
                        {Object.keys(arrangedNotifications).map(chatId => (
                          <MenuItem onClick={() => handleNotificationClick(arrangedNotifications[chatId][0].notificationChat)} key={chatId}>
                            {arrangedNotifications[chatId][0].notificationChat.isGroupChat ? (
                              <>
                                <UserChatWidget
                                  name={arrangedNotifications[chatId][0].notificationChat.chatName}
                                  picturePath={arrangedNotifications[chatId][0].notificationChat.groupPicture}
                                  lastMessage={`${arrangedNotifications[chatId].length} unread messages`}
                                />
                              </>
                            ) : (
                              <>
                                <UserChatWidget
                                  name={getSenderName(userId, arrangedNotifications[chatId][0].notificationChat.users)}
                                  picturePath={getSenderPicture(userId, arrangedNotifications[chatId][0].notificationChat.users)}
                                  lastMessage={`${arrangedNotifications[chatId].length} unread messages`}
                                />
                              </>
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
                      </>
                    ) : (
                      <MenuItem>
                        No Notifications
                      </MenuItem>
                    )}
                  </Menu>



                  <Tooltip title="Help"><IconButton> <HelpIcon sx={{ color: dark, fontSize: "25px" }} /> </IconButton></Tooltip>

                </FlexBetween>
              </Box>

              {/*  Avatar */}
              <Box sx={{ ml: 3 }}>
                <Tooltip title="Open profile settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt="Account " src={picturePath} sx={{ width: 46, height: 46 }} />
                  </IconButton>
                </Tooltip>
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
                  <MenuItem onClick={() => { dispatch(setLogout()); navigate("/") }}>
                    <LogoutIcon sx={{ fontSize: "20px", mr: 1 }} />
                    Logout
                  </MenuItem>
                  <MenuItem onClick={handleClickOpen}>
                    <DeleteAccountIcon sx={{ fontSize: "20px", mr: 1 }} />
                    Delete Account
                  </MenuItem>
                </Menu>
              </Box>
            </>
            :
            // Mobile Settings
            // Avatar With Drawer

            <Box sx={{ mr: 2, display: 'flex', flexDirection: 'row-reverse', width: '100%', alignItems: 'center' }}>
              <Tooltip title="Open settings" >
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="end"
                  onClick={toggleDrawer('right', true)}
                  sx={{ ...(open && { display: 'none' }), display: { display } }}
                >

                  <Avatar alt="Account " src={picturePath} sx={{ width: 46, height: 46 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Notifications">
                <IconButton onClick={handleOpenNotificationMenu}>
                  <Badge badgeContent={notifications.length} color="error" overlap="circular">
                    <Notifications sx={{ color: dark, fontSize: "25px" }} />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Drawer
                sx={{
                  width: 240,
                  flexShrink: 0,
                  '& .MuiDrawer-paper': {
                    width: 240,
                  },
                }}
                variant="persistent"
                anchor="right"
                open={state['right']}
              >
                <DrawerHeader>
                  <IconButton onClick={toggleDrawer('right', false)}>
                    {theme.direction === 'rtl' ? <ChevronLeft /> : <ChevronRight />}
                  </IconButton>
                  <Typography
                    fontWeight="bold"
                    fontSize="1.5em"
                    color="neutralLight"
                    onClick={() => navigate("/home")}
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
                  <IconButton>
                    <ProfileIcon sx={{ color: dark, fontSize: "25px", mr: 1 }} />
                    Profile
                  </IconButton>

                  <Divider />

                  <IconButton onClick={() => dispatch(setMode())}>
                    {theme.palette.mode === "dark" ? (
                      <LightModeIcon sx={{ fontSize: "25px", mr: 1 }} />
                    ) : (
                      <DarkModeIcon sx={{ color: dark, fontSize: "25px", mr: 1 }} />
                    )}
                    Theme
                  </IconButton>
                  <IconButton>
                    <MessageIcon sx={{ color: dark, fontSize: "25px", mr: 1 }} />
                    Chat
                  </IconButton>
                  <IconButton>
                    <HelpIcon sx={{ color: dark, fontSize: "25px", mr: 1 }} />
                    Help
                  </IconButton>

                  <br />
                  <hr width="100%" />

                  <IconButton onClick={() => { dispatch(setLogout()); navigate("/") }}><LogoutIcon sx={{ color: dark, fontSize: "25px", mr: 1 }} />Log Out</IconButton>
                  <IconButton onClick={handleClickOpen}><DeleteAccountIcon sx={{ color: dark, fontSize: "25px", mr: 1 }} />Delete Account</IconButton>
                </Box>
              </Drawer>
            </Box>
          }
          <Dialog
            open={open}
            onClose={handleClose}
            maxWidth='sm'
            fullWidth
            PaperProps={{
              component: 'form',
              onSubmit: (event) => {
                event.preventDefault();
                handleDeleteConfirm();
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
export default Navbar;