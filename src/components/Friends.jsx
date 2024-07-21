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

const Friends = ({ postId, friendId, name, subtitle, userPicturePath, getPosts }) => {

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const { _id } = useSelector((state) => state.user);
    const token = useSelector((state) => state.token);
    const friends = useSelector((state) => state.user.friends);

    const { palette } = useTheme();
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
    const patchFriend = async () => {
        const response = await api.put(`${Apis.user.index}/${_id}/${friendId}`);
        if (response.result) {
            dispatch(setFriends({ friends: response.friends }));
        } else {
            toast.error("Unable To Add And Remove Friends!");
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

            {_id !== friendId ?
                // show add or remove friend icon
                <IconButton
                    onClick={() => patchFriend()}
                    sx={{ backgroundColor: primaryLight, p: "0.6rem" }}
                >
                    {isFriends ? (
                        <PersonRemoveOutlined sx={{ color: primaryDark }} />
                    ) : (
                        <PersonAddOutlined sx={{ color: primaryDark }} />
                    )}
                </IconButton>
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
            }
        </FlexBetween>
    )
}

export default Friends;