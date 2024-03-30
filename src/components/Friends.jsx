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
import { Box, IconButton, Typography, useTheme, Menu, MenuItem,  ListItemIcon} from "@mui/material";
// state
import { useDispatch, useSelector } from "react-redux";
import { setFriends } from "state";
// components
import FlexBetween from "./FlexBetween";
import UserImage from "./UserImage";
// react
import { useNavigate } from "react-router-dom";

const Friends = ({ postId, friendId, name, subtitle, userPicturePath, getPosts }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { _id } = useSelector((state) => state.user);
    const token = useSelector((state) => state.token);
    const friends = useSelector((state) => state.user.friends);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);


    const { palette } = useTheme();
    const primaryLight = palette.primary.light;
    const primaryDark = palette.primary.dark;
    const main = palette.neutral.main;
    const medium = palette.neutral.medium;

    const isFriends = friends.find((friend) => friend._id === friendId) !== undefined;

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    // add or remove friend
    const patchFriend = async () => {
        const response = await fetch(`http://localhost:3001/users/${_id}/${friendId}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        const data = await response.json();
        dispatch(setFriends({ friends: data }));
    }

    const handleDeletePost = async () => {
        try {
            const response = await fetch(`http://localhost:3001/posts/${postId}/delete`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const res = await response.json();
            if (res.result) {
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
            <FlexBetween gap="1rem">
                <UserImage image={userPicturePath} size="55px" />
                <Box
                    onClick={() => {
                        navigate(`/profile/${friendId}`);
                        navigate(0);
                    }}
                >
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
            {_id !== friendId ? <IconButton
                onClick={() => patchFriend()}
                sx={{ backgroundColor: primaryLight, p: "0.6rem" }}
            >
                {isFriends ? (
                    <PersonRemoveOutlined sx={{ color: primaryDark }} />
                ) : (
                    <PersonAddOutlined sx={{ color: primaryDark }} />
                )}
            </IconButton> :
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
                        <MenuItem onClick={handleClose}>
                            <ListItemIcon>
                                <Edit />
                            </ListItemIcon>
                            <Typography variant="inherit">Edit</Typography>
                        </MenuItem>
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