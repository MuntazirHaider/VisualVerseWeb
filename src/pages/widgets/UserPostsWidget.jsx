// icons
import {
    ChatBubbleOutlineOutlined,
    FavoriteBorderOutlined,
    FavoriteOutlined,
    ShareOutlined,
    SendRounded as SendIcon,
    MoreVert,
    Edit,
    Delete
} from '@mui/icons-material';
// @mui
import { Box, Divider, IconButton, Typography, useTheme, TextField, Paper, Menu, MenuItem,  ListItemIcon } from '@mui/material';
// components
import FlexBetween from 'components/FlexBetween';
import Friends from "components/Friends";
import WidgetWrapper from 'components/WidgetWrapper';
import UserImage from 'components/UserImage';
// react
import { useState } from 'react';
// state
import { useDispatch, useSelector } from 'react-redux';
import { setPost } from 'state';

const UserPostWidget = ({
    postId,
    postUserId,
    fullName,
    description,
    // location,
    picture,
    userPicturePath,
    likes,
    comments,
    getPosts,
}) => {
    const dispatch = useDispatch();

    const [isComments, setIsComments] = useState(false);
    const [comment, setComment] = useState('');
    const token = useSelector((state) => state.token);
    const { picturePath, firstName, middleName, lastName } = useSelector((state) => state.user);
    const loggedInUserId = useSelector((state) => state.user._id);
    const isLiked = Boolean(likes[loggedInUserId]) || false;
    const likeCount = (Object.keys(likes).length) || 0;
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const { palette } = useTheme();
    const main = palette.neutral.main;
    const mediumMain = palette.neutral.mediumMain;
    const primary = palette.primary.dark;

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    // like post
    const patchLike = async () => {
        try {
            const body = JSON.stringify({ userId: loggedInUserId });

            const response = await fetch(`http://localhost:3001/posts/${postId}/like`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-type": "application/json",
                },
                body: body,
            });

            if (!response.ok) {
                throw new Error('Failed to patch like.');
            }

            console.log("response", response);

            const updatedPost = await response.json();
            dispatch(setPost({ post: updatedPost }));
        } catch (error) {
            console.error('Error in patching like:', error);
        }
    };

    const handleSubmitComment = async () => {
        if (comment.trim() !== '') {
            const body = {
                "userId": loggedInUserId,
                "name": `${firstName}${middleName}${lastName}`,
                "picturePath": picturePath,
                "comment": comment,
            };

            const response = await fetch(`http://localhost:3001/posts/${postId}/comment`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body),
            });

            const res = await response.json();
            console.log("res", res);
            if (res.result) {
                getPosts();
                setComment('');
            }
        }
    };

    const handleDeleteComment = async (commentMsg) => {
        try {
            const response = await fetch(`http://localhost:3001/posts/${postId}/comment/delete`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ deletedComment: commentMsg })
            });

            const res = await response.json();
            if (res.result) {
                getPosts();
            } else {
                console.error('Failed to delete comment.');
            }
        } catch (error) {
            console.error('Error in deleting comment:', error);
        }
    }



    return (
        <WidgetWrapper mb="2rem">
            <Friends
            postId={postId}
                friendId={postUserId}
                name={fullName}
                // subtitle={location}
                userPicturePath={userPicturePath}
                getPosts={getPosts}
            />

            <Typography color={main} sx={{ mt: "1rem" }}>{description}</Typography>
            {picture && (
                <img
                    width="100%"
                    height="auto"
                    style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
                    src={`http://localhost:3001/assets/${picture}`}
                    alt="post"
                />
            )}
            <FlexBetween mt="0.25rem">
                <FlexBetween gap="1rem">

                    <FlexBetween gap="0.3rem">
                        <IconButton onClick={patchLike}>
                            {isLiked ? (
                                <FavoriteOutlined sx={{ color: primary }} />
                            ) : (
                                <FavoriteBorderOutlined />
                            )}
                        </IconButton>
                        <Typography>{likeCount}</Typography>
                    </FlexBetween>

                    <FlexBetween gap="0.3rem">
                        <IconButton onClick={() => setIsComments(!isComments)}>
                            <ChatBubbleOutlineOutlined />
                        </IconButton>
                        <Typography>{(comments.length) || 0}</Typography>
                    </FlexBetween>

                </FlexBetween>
                <IconButton><ShareOutlined /></IconButton>
            </FlexBetween>
            {isComments && (
                <Paper
                    sx={{
                        maxHeight: (comments.length > 5) ? '450px' : 'auto',
                        overflow: 'auto',
                        mt: 2,
                        p: 2,
                    }}
                >
                    <Box sx={{ my: 2, mb: 3 }}>
                        <FlexBetween gap="0.5rem">
                            <UserImage image={picturePath} size={40} />
                            <TextField
                                id="standard-basic"
                                label="Comment"
                                variant="standard"
                                fullWidth
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                            <IconButton onClick={handleSubmitComment}>
                                <SendIcon />
                            </IconButton>
                        </FlexBetween>
                    </Box>
                    {comments.map((comment, i) => (
                        <Box key={`${comment.comment}-${i}`} >
                            <Box sx={{ my: 2, display: 'flex' }}>
                                <Box>
                                    <UserImage image={comment.picturePath} size={40} />
                                </Box>
                                <Box sx={{ ml: 1, flexGrow: 1 }}>
                                    <Typography sx={{ color: main }}>{comment.name}</Typography>
                                    <Typography sx={{ color: mediumMain, textAlign: 'justify' }}>{comment.comment}</Typography>
                                </Box>
                                {
                                    comment.userId === loggedInUserId && (
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
                                            <MenuItem onClick={() => handleDeleteComment(comment.comment)}>
                                                <ListItemIcon>
                                                    <Delete />
                                                </ListItemIcon>
                                                <Typography variant="inherit">Delete</Typography>
                                            </MenuItem>
                                        </Menu>
                                    </>
                                    )
                                }
                            </Box>
                            <Divider />
                        </Box>
                    ))}
                </Paper>
            )}
        </WidgetWrapper>
    )
}

export default UserPostWidget;
