import { useState, useEffect } from 'react'
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
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    Badge
} from '@mui/material'
// components
import FlexBetween from 'components/FlexBetween'
import AddGroupModalWidget from './AddGoupModalWidget';
import ScrollableChats from './ScrollableChats';
import PreviewImage from 'components/PreviewImage';
// redux
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedChat, setChats } from 'state';
// routes
import RestApiClient from "routes/RestApiClient";
import Apis from "routes/apis";
// icons
import {
    West,
    Send,
    MoreVert,
    MoodOutlined,
    Logout,
    Groups,
    VideoCameraBack,
    Image,
    Description,
    Headphones,
} from '@mui/icons-material';
// utils  
import Lottie from "lottie-react"
import { toast } from "react-toastify";
import EmojiPicker from 'emoji-picker-react';
import { getSenderId, getSenderName, getSenderPicture } from 'utils/ChatUtils';
import { uploadFile } from 'utils/UploadUtil';
// assets
import { ClipLoader } from 'react-spinners';
import animationData from 'assets/animations/typing.json'
import { useSocket } from 'context/SocketContext';

// variables
var selectedChatCompare;

const SingleChat = ({ userId, chats, handleChatsUpdate }) => {

    const selectedChat = useSelector((state) => state.selectedChat);
    const token = useSelector((state) => state.token);
    const mode = useSelector((state) => state.mode);
    const onlineUsers = useSelector((state) => state.onlineUsers);
    const friends = useSelector((state) => state.user.friends);
    const { firstName, middleName, lastName } = useSelector((state) => state.user);

    const [isEmojiVisible, setIsEmojiVisible] = useState(false);               /* for toggling emoji box */
    const [openGroupUpdateModal, setOpenGroupUpdateModal] = useState(false);   /* fo toggling group update modal */
    const [anchorEl, setAnchorEl] = useState(null);                            /* for toggling menu (group setting and leave group options) */
    const [message, setMessage] = useState("");                                /* for storing a message */
    const [allMessage, setAllMessage] = useState([]);                          /* for storing all messages of this chat */
    const [isTyping, setIsTyping] = useState(false);                           /* to toggling typing indicator */
    const [typing, setTyping] = useState(false)                                /* to know if socket receive typing indication */
    const [imagePreview, setImagePreview] = useState(false);                   /* flag to toggle image preview modal */
    const [mediaDial, setMediaDial] = useState(false)                          /* dial to select image and video to send */
    const [mediaType, setMediaType] = useState('');                          /* to specify what type of media user send */
    const [isUploading, setIsUploading] = useState(false);                   /* flag to know is shared file uploading to cloudinary or not */

    const { socket } = useSocket();
    const { palette } = useTheme();
    const dispatch = useDispatch();
    const api = new RestApiClient(token);

    // colors
    const neutralLight = palette.neutral.light;
    const neutralMain = palette.neutral.main
    const medium = palette.neutral.medium;
    const altBackground = palette.background.alt;

    // variable
    let isGroupChat = false;
    const open = Boolean(anchorEl);
    if (selectedChat !== null) {
        var { users, groupPicture, chatName } = selectedChat;
        var userCount = users?.length || 0;
        isGroupChat = selectedChat.isGroupChat;
        var senderId = getSenderId(userId, users);
        var senderName = getSenderName(userId, users);
        var senderPicture = getSenderPicture(userId, users);
        var isOnline = onlineUsers.includes(senderId);
    }

    // fetch all messages for specific chat
    const fetchMessages = async () => {
        if (selectedChat) {
            try {
                const response = await api.get(`${Apis.messages.index}/${selectedChat._id}`);

                if (response.result) {
                    setAllMessage(response.data);
                    if (socket) socket.emit("chats: join chat", selectedChat._id);
                }
            } catch (error) {
                console.error(error);
            }
        }
    }

    // to add emoji in text
    const handleEmojiSelect = (emojiObject) => {
        setMessage(message + emojiObject.emoji);
    };

    // to toggle typing indicator 
    const typingHandler = (msg) => {
        setMessage(msg);

        if (!typing) {
            setTyping(true);
            socket.emit("chats: typing", selectedChat._id, userId);
            setTimeout(() => {
                socket.emit("chats: stop typing", selectedChat._id);
                setTyping(false);
            }, 3000);
        }
    }

    // to toggle menu , update group modal and media dial
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
        handleClose();
        setOpenGroupUpdateModal(true);
    };

    const handleCloseImagePreview = () => {
        setImagePreview(false);
    }

    const handleOpenImagePreview = () => {
        setImagePreview(true);
    }

    const handleOpenMediaDial = () => {
        setIsEmojiVisible(false);
        setMediaDial(true);
    }

    const handleCloseMediaDial = () => setMediaDial(false);

    // to toggle isUploding state
    const handleOnIsUploading = () => setIsUploading(true);

    const handleOffIsUploading = () => setIsUploading(false);

    const createMessage = async (message, chatId) => {
        if (socket) {
            try {
                const body = {
                    "content": message,
                    chatId,
                    "contentType": 'info',
                }
                const response = await api.post(Apis.messages.index, body);
                if (response.result) {
                    socket.emit("chats: new message send", response.data);
                }
            } catch (error) {
                console.error(error);
                toast.error("Unable to send message");
            }
        }
    }

    // to leave a group
    const handleLeaveGroup = async () => {
        const chatId = selectedChat?._id;
        const chatName = selectedChat?.chatName;
        const body = {
            chatId,
            userId
        }
        try {
            const response = await api.put(Apis.group.remove, body);
            if (response.result) {
                const updateChats = chats.filter((chat) => chat._id !== response.data._id)
                handleClose();
                dispatch(setChats({ chats: [...updateChats] }));
                dispatch(setSelectedChat({ selectedChat: null }));
                toast.success(`You leave ${chatName}`);
                createMessage(`${firstName} ${middleName} ${lastName} left`, chatId);
                socket.emit("chats: leave group", response.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Unable to leave group");
        }
    }

    // unselect a chat
    const handleGoBack = () => {
        dispatch(setSelectedChat({ selectedChat: null }));
        selectedChatCompare = null;
    }

    // send message by pressing enter key
    const handleEnter = (key) => {
        if (key === 'Enter') {
            handleSubmit();
        }
    }

    // to send a message
    const handleSubmit = async () => {
        if (socket) {
            if (!isGroupChat && friends.every((f) => f._id !== senderId)) {
                toast.error(`${senderName} is not your friend`);
                return;
            }
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
                    setAllMessage([...allMessage, response.data]);
                    handleChatsUpdate();
                    socket.emit("chats: new message send", response.data);
                }
            } catch (error) {
                console.error(error);
                toast.error("Unable to send message");
            }
        }
    }

    const handleUploadMedia = async (event) => {
        handleCloseMediaDial(); // Close the SpeedDial after selecting a media type
        if (!isGroupChat && friends.every((f) => f._id !== senderId)) {
            toast.error(`${senderName} is not your friend`);
            return;
        }
        handleOnIsUploading();
        const file = event.target.files[0]; // Access the selected file
        if (!file) return; // Ensure a file is selected

        try {
            let result;

            switch (mediaType) {
                case 'image':
                    result = await uploadFile(file, 'image');
                    setMediaType('image')
                    break;
                case 'video':
                    result = await uploadFile(file, 'video');
                    setMediaType('video')
                    break;
                case 'audio':
                    result = await uploadFile(file, 'audio');
                    setMediaType('audio')
                    break;
                case 'document':
                    result = await uploadFile(file, 'document');
                    setMediaType('document')
                    break;
                default:
                    console.error("Unsupported media type:", mediaType);
                    toast.error("Unsupported media type");
                    return;
            }

            if (result && result.secure_url) {
                try {
                    const body = {
                        "content": result.secure_url,
                        "contentType": mediaType,
                        "chatId": selectedChat._id,
                    };

                    const response = await api.post(Apis.messages.index, body);
                    if (response.result) {
                        setMediaType('');
                        handleOffIsUploading(); // Reset uploading state
                        setAllMessage([...allMessage, response.data]);
                        handleChatsUpdate();
                        socket.emit("chats: new message send", response.data);
                    } else {
                        handleOffIsUploading(); // Reset uploading state
                        toast.error("Failed to send media");
                    }
                } catch (error) {
                    console.error("Failed to send media:", error);
                    toast.error("Failed to send media");
                }
            } else {
                toast.error("Failed to upload media");
            }
        } catch (error) {
            console.error("Failed to upload media:", error);
            handleOffIsUploading();
            toast.error("Failed to upload media");
        }
    };


    // useEffect handling socket
    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectedChat;
        // eslint-disable-next-line
    }, [selectedChat])

    useEffect(() => {
        if (socket) {
            socket.emit("chats: setup", userId);
            socket.on("chats: typing", (roomId, typerId) => {
                if (typerId !== userId && roomId === selectedChat?._id) setIsTyping(true);
            });

            socket.on("chats: stop typing", () => {
                setIsTyping(false)
            });
            return () => {
                // Clean up socket event listeners
                socket.off('connected')
                socket.off('chats: typing')
                socket.off('chats: stop typing')
            }
        }
        // eslint-disable-next-line
    }, [socket])

    useEffect(() => {
        if (socket) {
            socket.on("chats: new message received", (newMessage) => {
                if (selectedChatCompare !== null || selectedChatCompare?._id === newMessage.chat._id) {
                    setAllMessage([...allMessage, newMessage]);
                }
                handleChatsUpdate();
            });

            socket.on('chats: group chat leaved', (leavedGroup) => {
                if (selectedChatCompare !== null || selectedChatCompare?._id === leavedGroup._id) {
                    dispatch(setSelectedChat({ selectedChat: leavedGroup }));
                }
            })

            return () => {
                // Clean up socket event listener
                socket.off('chats: new message received')
                socket.off('chats: group chat leaved')
            }
        }
    });

    return (
        <Box height={1} display='flex' justifyContent='space-between' flexDirection='column' sx={{ overflow: 'auto', scrollbarWidth: 'none', borderRadius: 2 }}>
            {selectedChat !== null ? <>
                {/* Specific chat */}
                <Box position='sticky' top={0} zIndex={1} bgcolor={altBackground}>
                    <FlexBetween>
                        {/* header */}
                        <Box display="flex" alignItems="center" >
                            {/* go back icon */}
                            <IconButton onClick={handleGoBack}>
                                <West />
                            </IconButton>
                            {/* user or group image and count of members of a group*/}
                            <IconButton onClick={handleOpenImagePreview}>
                                <Badge color='success' variant='dot' badgeContent='' overlap="circular" invisible={!isOnline || isGroupChat ? true : false}>
                                    <Avatar alt="Account " src={isGroupChat ? groupPicture : senderPicture} sx={{ width: 46, height: 46 }} />
                                </Badge>
                            </IconButton>
                            <Box>
                                <Typography sx={{ color: neutralMain }} variant='h5'>{isGroupChat ? chatName : senderName}</Typography>
                                {isGroupChat && <Typography color={medium} fontSize="0.75rem">
                                    {userCount} Members
                                </Typography>}
                            </Box>
                        </Box>

                        <Box>
                            {/* menu bar to display options */}
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
                <Box display='flex' flexGrow={1} flexDirection='column-reverse' px={2}>
                    <ScrollableChats messages={allMessage} />
                </Box>

                {
                    isUploading && <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: 200,
                            maxHeight: { xs: 200, md: 167 }
                        }}
                    >
                        <ClipLoader
                            color="inherit"
                            loading={true}
                            size={50}
                            aria-label="Loading Spinner"
                            data-testid="loader"
                        />
                    </Box>
                }

                {/* typing indicator */}
                {
                    isTyping && <Box width={70} height={50}>
                        <Lottie animationData={animationData} loop={true} />
                    </Box>
                }

                {/* emoji box */}
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
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        position: 'sticky',
                        bottom: 0,
                        mt: 5,
                        width: 1,
                        py: 1,
                        backgroundColor: neutralLight,
                        zIndex: 1000,
                        boxShadow: 1,
                    }}
                >
                    {/* Display emoji icon to access emojis */}
                    <IconButton onClick={() => setIsEmojiVisible(!isEmojiVisible)}>
                        <MoodOutlined />
                    </IconButton>

                    {/* SpeedDial for sharing media */}
                    <Box
                        sx={{
                            position: 'relative',
                            mr: 1,
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <SpeedDial
                            ariaLabel="SpeedDial controlled open example"
                            icon={<SpeedDialIcon />}
                            onClose={handleCloseMediaDial}
                            onOpen={handleOpenMediaDial}
                            open={mediaDial}
                            direction="up"
                            sx={{
                                width: 40,
                                height: 40,
                                '& .MuiSpeedDial-fab': {
                                    bgcolor: neutralLight,
                                    boxShadow: 'none',
                                    color: neutralMain,
                                    '&:hover': {
                                        bgcolor: neutralLight,
                                        color: neutralMain,

                                    },
                                    width: 30,
                                    height: 30,
                                },
                            }}
                        >
                            <SpeedDialAction
                                icon={<Description />}
                                tooltipTitle='Documents'
                                onClick={() => {
                                    setMediaType('document');
                                    document.getElementById('fileInput').click();
                                }}
                            />
                            <SpeedDialAction
                                icon={<Headphones />}
                                tooltipTitle='Audio'
                                onClick={() => {
                                    setMediaType('audio');
                                    document.getElementById('fileInput').click();
                                }}
                            />
                            <SpeedDialAction
                                icon={<VideoCameraBack />}
                                tooltipTitle='Video'
                                onClick={() => {
                                    setMediaType('video');
                                    document.getElementById('fileInput').click();
                                }}
                            />
                            <SpeedDialAction
                                icon={<Image />}
                                tooltipTitle='Image'
                                onClick={() => {
                                    setMediaType('image');
                                    document.getElementById('fileInput').click();
                                }}

                            />
                        </SpeedDial>
                    </Box>

                    {/* Input field */}
                    <Box
                        backgroundColor={palette.background.alt}
                        borderRadius="9px"
                        padding="0.3rem 0.6rem"
                        flexGrow={1}
                        display="flex"
                        alignItems="center"
                    >
                        <InputBase
                            placeholder='Type here...'
                            value={message}
                            onChange={(e) => typingHandler(e.target.value)}
                            onKeyDown={(e) => handleEnter(e.key)}
                            sx={{ width: '100%' }}
                        />
                    </Box>

                    {/* Send icon */}
                    <IconButton onClick={handleSubmit} disabled={message.length === 0}>
                        <Send />
                    </IconButton>
                </Box>
            </> :
                // if no chat selected
                <Box display='flex' justifyContent='center' alignItems='center' height={1}>
                    <Typography variant='h3'>Select a user to chat</Typography>
                </Box>
            }

            {/* modal for add group */}
            <AddGroupModalWidget onClose={handleCloseUpdateModal} open={openGroupUpdateModal} group={selectedChat} userId={userId} chats={chats} />

            {/* modal for preview image */}
            <PreviewImage open={imagePreview} handleClosePreview={handleCloseImagePreview} img={isGroupChat ? groupPicture : senderPicture || ''} />

            {/*  input field to receives file */}
            <input
                id="fileInput"
                type="file"
                accept="*/*"
                style={{ display: 'none' }} // Hide the input visually
                onChange={(event) => handleUploadMedia(event)}
            />
        </Box >
    )
}

export default SingleChat