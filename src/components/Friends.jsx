import { useState } from "react";
// icons
import {
    PersonAddOutlined,
    PersonRemoveOutlined,
    MoreVert,
    Edit,
    Delete
} from "@mui/icons-material";
// @mui
import { Box, IconButton, Typography, useTheme, Menu, MenuItem, ListItemIcon } from "@mui/material";
// state
import { useDispatch, useSelector } from "react-redux";
import { setFriends } from "state";
import { useSocket } from 'context/SocketContext.js'
// routes
import RestApiClient from "routes/RestApiClient";
import Apis from "routes/apis";
// components
import FlexBetween from "./FlexBetween";
import UserImage from "./UserImage";
// react
import { useNavigate } from "react-router-dom";
// utils
import { toast } from "react-toastify";

const Friends = ({ postId, friendId, name, subtitle, userPicturePath, getPosts, isMyProfile = true }) => {

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const { _id } = useSelector((state) => state.user);
    const token = useSelector((state) => state.token);
    const friends = useSelector((state) => state.user.friends);
    const onlineUsers = useSelector((state) => state.onlineUsers);

    const { palette } = useTheme();
    const { socket } = useSocket();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const api = new RestApiClient(token);

    // colors
    const primaryLight = palette.primary.light;
    const primaryDark = palette.primary.dark;
    const main = palette.neutral.main;
    const medium = palette.neutral.medium;

    // variable
    const isFriends = friends.find((friend) => friend._id === friendId) !== undefined;

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    // add or remove friend
    const addFriend = async () => {
        const response = await api.post(`${Apis.friendRequest.send}/${friendId}`, { "requesterId": _id });
        if (response.result) {
            if (onlineUsers.includes(friendId)) {
                socket.emit("friend request: send requested", response.data);
            }
            toast.success("Friend request sent successfully");
        } else {
            toast.error(response.message);
        }
    }

    const removeFriend = async () => {
        const response = await api.delete(`${Apis.friendRequest.index}/${_id}/${friendId}`);
        if (response.result) {
            dispatch(setFriends({ friends: response.data }));
        } else {
            toast.error(response.message);
        }
    }

    // delete post
    const handleDeletePost = async () => {
        try {
            const response = await api.delete(`${Apis.post.index}/${postId}/delete`);
            if (response.result) {
                getPosts();
            } else {
                console.error('Failed to delete Post.');
            }
        } catch (error) {
            console.error('Error in deleting post:', error);
        }
    }
    
    return (
        <FlexBetween>

            <FlexBetween gap="1rem"
                onClick={() => {
                    navigate(`/profile/${friendId}`);
                }}>
                {/* image */}
                <UserImage image={userPicturePath} size="55px" />
                {/* display user name */}
                <Box>
                    <Typography
                        color={main}
                        variant="h5"
                        fontWeight="500"
                        sx={{
                            "&:hover": {
                                color: palette.primary.light,
                                cursor: "pointer"
                            }
                        }}
                    >
                        {name}
                    </Typography>
                    <Typography color={medium} fontSize="0.75rem">
                        {subtitle}
                    </Typography>
                </Box>
            </FlexBetween>

            {isMyProfile ? (_id !== friendId ?
                // show add or remove friend icon
                <>
                    {isFriends ? (
                        <IconButton sx={{ backgroundColor: primaryLight, p: "0.6rem" }} onClick={removeFriend}>
                            <PersonRemoveOutlined sx={{ color: primaryDark }} />
                        </IconButton>
                    ) : (
                        <IconButton sx={{ backgroundColor: primaryLight, p: "0.6rem" }} onClick={addFriend}>
                            <PersonAddOutlined sx={{ color: primaryDark }} />
                        </IconButton>
                    )}
                </>
                :
                // show option bars 
                <>
                    <IconButton
                        aria-label="more"
                        aria-controls={open ? 'long-menu' : undefined}
                        aria-expanded={open ? 'true' : undefined}
                        aria-haspopup="true"
                        onClick={handleClick}
                    >
                        <MoreVert />
                    </IconButton>
                    <Menu
                        id="long-menu"
                        MenuListProps={{
                            'aria-labelledby': 'long-button',
                        }}
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                    >
                        {/* edit option */}
                        <MenuItem onClick={handleClose}>
                            <ListItemIcon>
                                <Edit />
                            </ListItemIcon>
                            <Typography variant="inherit">Edit</Typography>
                        </MenuItem>
                        {/* delete option */}
                        <MenuItem onClick={handleDeletePost}>
                            <ListItemIcon>
                                <Delete />
                            </ListItemIcon>
                            <Typography variant="inherit">Delete</Typography>
                        </MenuItem>
                    </Menu>
                </>
            ) : null}
        </FlexBetween>
    )
}

export default Friends;