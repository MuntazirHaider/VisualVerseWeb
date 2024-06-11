import { useState, useEffect } from 'react'
import EmojiPicker from 'emoji-picker-react';
// @mui
import {
    Box,
    useTheme,
    IconButton,
    Avatar,
    Typography,
    Divider,
    InputBase,
    Menu,
    MenuItem,
    ListItemIcon,
} from '@mui/material'
// components
import FlexBetween from 'components/FlexBetween'
// pages
import AddGroupModalWidget from './AddGoupModalWidget';
import ScrollableChats from './ScrollableChats';
// redux
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedChat, setChats, setNotifications } from 'state';
// routes
import RestApiClient from "routes/RestApiClient";
import Apis from "routes/apis";
// socket.io
import { io } from "socket.io-client";
// icons
import {
    West,
    Send,
    MoreVert,
    MoodOutlined,
    Logout,
    Groups,
    VideocamRounded as VideoCall,
} from '@mui/icons-material';
// utils
import { toast } from "react-toastify";
import Lottie from "lottie-react"
import { getSenderName, getSenderPicture } from 'utils/ChatUtils';
// assets
import animationData from 'assets/animations/typing.json'

const ENDPOINT = process.env.SERVER_ENDPOINT ?? "http://localhost:3001";
var socket, selectedChatCompare;


const SingleChat = ({ userId }) => {
    const theme = useTheme();
    const neutralLight = theme.palette.neutral.light;
    const neutralMain = theme.palette.neutral.main
    const medium = theme.palette.neutral.medium;
    const altBackground = theme.palette.background.alt;

    const selectedChat = useSelector((state) => state.selectedChat);
    const chats = useSelector((state) => state.chats);
    const token = useSelector((state) => state.token);
    const mode = useSelector((state) => state.mode);
    const notifications = useSelector((state) => state.notifications);

    const api = new RestApiClient(token);
    const dispatch = useDispatch();

    let isGroupChat = false;
    if (selectedChat !== null) {
        var { users, groupPicture, chatName } = selectedChat;
        isGroupChat = selectedChat.isGroupChat;
    }

    const [isEmojiVisible, setIsEmojiVisible] = useState(false);
    const [openGroupUpdateModal, setOpenGroupUpdateModal] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [message, setMessage] = useState("");
    const [allMessage, setAllMessage] = useState([]);
    const [socketConnected, setSocketConnected] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typing, setTyping] = useState(false)
    const open = Boolean(anchorEl);

    const fetchChats = async () => {
        if (selectedChat) {
            try {
                const response = await api.get(`${Apis.messages.index}/${selectedChat._id}`);

                if (response.result) {
                    setAllMessage(response.data);
                    socket.emit("chats: join chat", selectedChat._id)
                }
            } catch (error) {
                console.error(error);
            }
        }
    }

    const handleEmojiSelect = (emojiObject) => {
        setMessage(message + emojiObject.emoji);
    };

    const typingHandler = (msg) => {
        setMessage(msg);

        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit("chats: typing", selectedChat._id, userId);
            setTimeout(() => {
                socket.emit("chats: stop typing", selectedChat._id);
                setTyping(false);
            }, 3000);
        }
    }

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleCloseUpdateModal = () => {
        setOpenGroupUpdateModal(false);
    };

    const handleOpenUpdateModal = () => {
        setOpenGroupUpdateModal(true);
    };

    const handleLeaveGroup = () => {
        const body = {
            chatId: selectedChat?._id,
            userId
        }
        try {
            const response = api.put(Apis.group.remove, body);
            if (response.result) {
                const updateChats = chats.filter((chat) => chat._id !== response.data._id)
                dispatch(setChats({ chats: [...updateChats] }));
                dispatch(setSelectedChat({ selectedChat: null }));
                toast.success("You leave the group");
            }
        } catch (error) {
            console.error(error);
            toast.error("Unable to leave group");
        }
    }

    const handleGoBack = () => {
        dispatch(setSelectedChat({ selectedChat: null }));
        selectedChatCompare = null;
    }

    const handleEnter = (key) => {
        if (key === 'Enter') {
            handleSubmit();
        }
    }

    const handleSubmit = async () => {
        try {
            const body = {
                "content": message,
                "chatId": selectedChat._id
            }
            socket.emit("chats: stop typing", selectedChat._id);
            const response = await api.post(Apis.messages.index, body);
            if (response.result) {
                setMessage('');
                setIsEmojiVisible(false);
                setAllMessage([...allMessage, response.data])
                socket.emit("chats: new message send", response.data)
            }
        } catch (error) {
            console.error(error);
            toast.error("Unable to send message");
        }
    }

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


    useEffect(() => {
        fetchChats();
        // eslint-disable-next-line
        selectedChatCompare = selectedChat;
    }, [selectedChat])

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("chats: setup", userId)
        socket.on("connected", () => setSocketConnected(true));
        socket.on("chats: typing", (roomId, typerId) => {
            if (typerId !== userId && roomId === selectedChat?._id) setIsTyping(true);
        });

        socket.on("chats: stop typing", () => {
            setIsTyping(false)
        });
        // dispatch(setNotifications({ notifications: [] }));
        return () => {
            // Clean up socket event listeners
            socket.off('connected')
            socket.off('chats: typing')
            socket.off('chats: stop typing')
        }
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        socket.on("chats: new message received", (newMessage) => {
            if (selectedChatCompare === null || selectedChatCompare._id !== newMessage.chat._id) {
                if (!notifications.includes(newMessage)) {
                    handleCreateNotification(newMessage)
                }
            } else {
                setAllMessage([...allMessage, newMessage])
            }
        });
        return () => {
            // Clean up socket event listener
            socket.off('chats: new message received')
        }
    })

    return (
        <Box height={1} display='flex' justifyContent='space-between' flexDirection='column' sx={{ overflow: 'auto', scrollbarWidth: 'none' }}>
            {/* header */}
            {selectedChat !== null ? <>
                <Box position='sticky' top={0} zIndex={1} bgcolor={altBackground}>
                    <FlexBetween>
                        {/* <Box> */}
                        <Box display="flex" alignItems="center" >
                            <IconButton onClick={handleGoBack}>
                                <West />
                            </IconButton>
                            <IconButton>
                                <Avatar alt="Account " src={isGroupChat ? groupPicture : getSenderPicture(userId, users)} sx={{ width: 46, height: 46 }} />
                            </IconButton>
                            <Box>
                                <Typography sx={{ color: neutralMain }} variant='h5'>{isGroupChat ? chatName : getSenderName(userId, users)}</Typography>
                                {isGroupChat && <Typography color={medium} fontSize="0.75rem">
                                    {isGroupChat ? users.length : 0} Members
                                </Typography>}
                            </Box>
                        </Box>
                        <Box>
                            <IconButton>
                                <VideoCall sx={{ fontSize: "27px" }} />
                            </IconButton>
                            {isGroupChat && <IconButton
                                aria-label="more"
                                aria-controls={open ? 'long-menu' : undefined}
                                aria-expanded={open ? 'true' : undefined}
                                aria-haspopup="true"
                                onClick={handleClick}
                            >
                                <MoreVert />
                            </IconButton>}
                            <Menu
                                id="long-menu"
                                MenuListProps={{
                                    'aria-labelledby': 'long-button',
                                }}
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={handleOpenUpdateModal}>
                                    <ListItemIcon>
                                        <Groups />
                                    </ListItemIcon>
                                    <Typography variant="inherit">Group Setting</Typography>
                                </MenuItem>
                                <MenuItem onClick={handleLeaveGroup}>
                                    <ListItemIcon>
                                        <Logout />
                                    </ListItemIcon>
                                    <Typography variant="inherit">Leave Group</Typography>
                                </MenuItem>
                            </Menu>
                        </Box>
                        {/* </Box> */}
                    </FlexBetween>
                    <Divider sx={{ color: neutralLight, width: 1 }} />
                </Box>
                {/* chats */}
                <Box display='flex' flexGrow={1} flexDirection='column-reverse'>
                    <ScrollableChats messages={allMessage}/>
                </Box>
                {isTyping && <Box width={70} height={50}>
                    <Lottie animationData={animationData} loop={true} />
                </Box>}
                {/* input fields */}
                <Box position='relative'>
                    <Box position="absolute" bottom="3px" zIndex="999">
                        <EmojiPicker
                            open={isEmojiVisible}
                            height="27rem"
                            width="auto"
                            theme={mode === 'light' ? 'light' : 'dark'}
                            autoFocusSearch={false}
                            skinTonePickerLocation='SEARCH'
                            previewConfig={{ showPreview: false }}
                            suggestedEmojisMode='recent'
                            onEmojiClick={handleEmojiSelect}
                        />
                    </Box>
                </Box>
                <FlexBetween backgroundColor={neutralLight} borderRadius="9px" padding="0.3rem 0.6rem" position='sticky' bottom={0} zIndex={1}>
                    <IconButton onClick={() => setIsEmojiVisible(!isEmojiVisible)}>
                        <MoodOutlined />
                    </IconButton>
                    <InputBase placeholder='Type here...' sx={{ width: 1 }} value={message} onChange={(e) => typingHandler(e.target.value)} onKeyDown={(e) => handleEnter(e.key)} />
                    <IconButton onClick={handleSubmit}>
                        <Send />
                    </IconButton>
                </FlexBetween>
            </> :
                <Box display='flex' justifyContent='center' alignItems='center' height={1}>
                    <Typography variant='h3'>Select a user to chat</Typography>
                </Box>
            }

            {/* modal for add group */}
            <AddGroupModalWidget onClose={handleCloseUpdateModal} open={openGroupUpdateModal} group={selectedChat} userId={userId} />
        </Box>
    )
}

export default SingleChat