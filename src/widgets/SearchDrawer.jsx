import { React, useState } from 'react'
// @mui
import {
    Box,
    useTheme,
    InputBase,
    Skeleton,
    SwipeableDrawer
} from '@mui/material';
// redux
import { useSelector, useDispatch } from "react-redux";
import { setChats, setSelectedChat } from 'state';
// component
import FlexBetween from 'components/FlexBetween';
// routes
import Apis from "routes/apis";
import RestApiClient from 'routes/RestApiClient';
import { useNavigate } from 'react-router-dom';
// pages
import UserChatWidget from 'widgets/UserChatWidget';
// icons
import {
    SearchRounded as SearchIcon,
} from '@mui/icons-material';
// utils
import { toast } from "react-toastify";

const SearchDrawer = ({ onOpen, onClose, drawerState, isChatSearch }) => {

    const theme = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const token = useSelector((state) => state.token);
    const chats = useSelector((state) => state.chats);

    const api = new RestApiClient(token);
    const [isLoading, setIsLoading] = useState(false);
    const [searchReults, setSearchReults] = useState([]);
    
    const neutralLight = theme.palette.neutral.light;

    const handleAccessChat = async (userId) => {
        try {
            const body = {
                "userId": userId,
            };
            const response = await api.post(Apis.chats.index, body);
            if (response.result) {
                const newChat = response.data;
                dispatch(setSelectedChat({ selectedChat: newChat }));
                if (chats.find(chat => newChat._id === chat._id)) {
                    onClose();
                    return;
                } else {
                    dispatch(setChats({ chats: [...chats, newChat] }));
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong, Please try again");
        }
        onClose();
    }

    const handleWatchProfile = (userId) => {
        navigate(`/profile/${userId}`)
    }

    const handleSearch = async (query) => {
        setIsLoading(true);
        try {
            const response = isChatSearch ? await api.get(`${Apis.chats.search}?search=${query}`) : await api.get(`${Apis.user.index}?search=${query}`);
            if (response.result) {
                setTimeout(() => {
                    setIsLoading(false);
                }, 1000);
                setSearchReults(response.data);
                console.log(searchReults);
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong, Please try again");
        }
    }

    return (
        <>
            {/* Swapable drawer for search */}
            < SwipeableDrawer
                open={drawerState}
                onOpen={onOpen}
                onClose={onClose}
                sx={{ width: 'auto' }
                }
            >
                {/* Search Bar */}
                < FlexBetween backgroundColor={neutralLight} borderRadius="9px" padding="0.1rem 0.5rem" mb="1rem" minWidth='300px' sx={{ m: 1 }}>
                    <SearchIcon sx={{ mr: 1 }} />
                    <InputBase placeholder='Search' sx={{ width: 1, height: '40px' }} onChange={(e) => handleSearch(e.target.value)} />
                </FlexBetween >

                {/* Show skelton when loading */}
                {
                    isLoading && (
                        <Box sx={{ my: 3, mx: 0.5 }}>
                            {Array.from({ length: 7 }).map((_, i) => (
                                <Skeleton key={i} variant="h1" sx={{ mb: 2, height: '32px', borderRadius: 1 }} />
                            ))}
                        </Box>
                    )
                }

                {/* Show Search Results */}
                {
                    (!isLoading && searchReults.length > 0) &&
                    <Box display="flex" flexDirection="column" gap="1rem" sx={{ mx: 1 }}>
                        {searchReults.map((user) => {
                            return <Box key={user._id} onClick={() => { isChatSearch ? handleAccessChat(user._id) : handleWatchProfile(user._id) }} >
                                <UserChatWidget name={`${user.firstName}${user.middleName}${user.lastName}`} picturePath={user.picturePath} />
                            </Box>
                        })}
                    </Box>
                }
            </SwipeableDrawer >
        </>
    )
}

export default SearchDrawer