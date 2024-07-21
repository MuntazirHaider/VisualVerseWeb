// @mui
import {
    Box,
    Divider,
    IconButton,
    Typography,
    useTheme,
    TextField,
    Paper,
    Menu,
    MenuItem,
    ListItemIcon
} from '@mui/material';
// icons
import {
    ChatBubbleOutlineOutlined,
    FavoriteBorderOutlined,
    FavoriteOutlined,
    ShareOutlined,
    SendRounded as SendIcon,
    MoreVert,
    Edit,
    Delete,
    ModeEdit,
    Cancel
} from '@mui/icons-material';
// components
import FlexBetween from 'components/FlexBetween';
import Friends from "components/Friends";
import WidgetWrapper from 'components/WidgetWrapper';
import UserImage from 'components/UserImage';
// routes
import RestApiClient from "routes/RestApiClient";
import Apis from "routes/apis";
// react
import { useState } from 'react';
// state
import { useDispatch, useSelector } from 'react-redux';
import { setPost } from 'state';
//  utils
import { toast } from "react-toastify";

const UserPostWidget = ({
    postId,
    postUserId,
    fullName,
    description,
    mediaType,
    media,
    userPicturePath,
    likes,
    comments,
    getPosts,
}) => {

    const [isComments, setIsComments] = useState(false);     /* for toggling comment section */
    const [isEditComment, setIsEditComment] = useState(false);     /* for toggling comment edit section */
    const [comment, setComment] = useState('');              /* for comment  */
    const [updatedComment, setUpdatedComment] = useState('');              /* for comment  */
    const [anchorEl, setAnchorEl] = useState(null);         /* for open edit and delete option of comment */
    const [selectedComment, setSelectedComment] = useState(null);  /* for selecting a comment to  edit or delete it */

    const token = useSelector((state) => state.token);
    const { picturePath, firstName, middleName, lastName, _id } = useSelector((state) => state.user);

    const dispatch = useDispatch();
    const { palette } = useTheme();
    const api = new RestApiClient(token);

    // colors
    const main = palette.neutral.main;
    const primary = palette.primary.dark;

    // variables
    const isLiked = Boolean(likes[_id]) || false;
    const likeCount = (Object.keys(likes).length) || 0;
    const open = Boolean(anchorEl);

    // to toggle menu for comment
    const handleClick = (event, comment) => {
        setAnchorEl(event.currentTarget);
        setSelectedComment(comment);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    // to close the edit comment option
    const handleCancelEditComment = () => {
        setIsEditComment(false);
        setSelectedComment(null);
    }

    const handleOpenEditComment = () => {
        handleClose();
        setUpdatedComment(selectedComment.comment);
        setIsEditComment(true);
    }

    // like post
    const patchLike = async () => {
        try {

            const body = { userId: _id };
            const response = await api.put(`${Apis.post.index}/${postId}/like`, body);

            if (response.result) {
                dispatch(setPost({ post: response.post }));
            } else {
                toast.error("Unable To Like And Dislike Post");
            }

        } catch (error) {
            console.error('Error in patching like:', error);
        }
    };

    // comment post
    const handleSubmitComment = async () => {
        if (comment.trim() !== '') {
            const body = {
                "userId": _id,
                "name": `${firstName}${middleName}${lastName}`,
                "picturePath": picturePath,
                "comment": comment,
            };
            const response = await api.post(`${Apis.post.index}/${postId}/comment`, body);
            if (response.result) {
                getPosts();
                setComment('');
            }
        }
    };

    // delete comment
    const handleDeleteComment = async () => {
        try {
            const body = { deletedComment: selectedComment.comment };
            setAnchorEl(null);
            const response = await api.delete(`${Apis.post.index}/${postId}/comment/delete`, body);
            if (response.result) {
                getPosts();
            } else {
                toast.error("Failed To Delete Comment!");
            }
        } catch (error) {
            console.error('Error in deleting comment:', error);
        }
    }

    // edit comment
    const handleEditComment = async () => {
        try {
            const body = { userId: _id, comment: selectedComment.comment, editedComment: updatedComment };
            const response = await api.put(`${Apis.post.index}/${postId}/comment/edit`, body);
            if (response.result) {
                getPosts();
            } else {
                toast.error("Failed To Edit Comment!");
            }
            handleCancelEditComment();
        } catch (error) {
            console.error('Error in editing comment:', error);
        }
    }

    return (
        <WidgetWrapper mb="2rem">

            {/* user details */}
            <Friends
                postId={postId}
                friendId={postUserId}
                name={fullName}
                userPicturePath={userPicturePath}
                getPosts={getPosts}
            />

            {/* for caption */}
            <Typography color={main} sx={{ mt: "1rem" }}>{description}</Typography>

            {/* display post based on its media type */}
            {media && (mediaType === 'image' ? (
                <img
                    width="100%"
                    height="100%"
                    style={{ borderRadius: "0.75rem", marginTop: "0.75rem", objectFit: 'cover', maxHeight: '650px', }}
                    src={media}
                    alt="post"
                />
            ) : (
                <video
                    width="100%"
                    height="auto"
                    style={{ borderRadius: "0.75rem", marginTop: "0.75rem", objectFit: 'cover', maxHeight: '650px', }}
                    src={media}
                    alt="post"
                    controls
                />)
            )}

            {/* lower part */}
            <FlexBetween mt="0.25rem">
                <FlexBetween gap="1rem">
                    {/* like icon */}
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

                    {/* comment icon */}
                    <FlexBetween gap="0.3rem">
                        <IconButton onClick={() => setIsComments(!isComments)}>
                            <ChatBubbleOutlineOutlined />
                        </IconButton>
                        <Typography>{(comments.length) || 0}</Typography>
                    </FlexBetween>

                </FlexBetween>
                {/* share icon */}
                <IconButton><ShareOutlined /></IconButton>
            </FlexBetween>

            {/* open comment section */}
            {isComments && (
                <Paper
                    sx={{
                        maxHeight: (comments.length > 5) ? '450px' : 'auto',
                        overflow: 'auto',
                        mt: 2,
                        p: 2,
                    }}
                >
                    {/* input field for comment */}
                    <Box sx={{ my: 2, mb: 3 }}>
                        <FlexBetween gap="0.5rem">
                            <UserImage image={picturePath} size={40} />
                            <TextField
                                id="standard-basic"
                                label="Comment"
                                variant="standard"
                                multiline
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                sx={{ flexGrow: 1 }}
                            />
                            <IconButton onClick={handleSubmitComment}>
                                <SendIcon />
                            </IconButton>
                        </FlexBetween>
                    </Box>

                    {/* list all comment */}
                    {comments.map((comment, i) => (
                        <Box key={`${comment.comment}-${i}`} >
                            <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
                                {/* display image, name and comment */}
                                <UserImage image={comment.picturePath} size={40} />
                                <Box sx={{ ml: 1, flexGrow: 1 }}>
                                    <Typography sx={{ color: main }}>{comment.name}</Typography>
                                    {/* <Typography sx={{ color: mediumMain, textAlign: 'justify' }}>{comment.comment}</Typography> */}
                                    <TextField
                                        variant='standard'
                                        fullWidth
                                        multiline
                                        value={(isEditComment && selectedComment?.comment === comment.comment) ? updatedComment : comment.comment}
                                        disabled={!(isEditComment && selectedComment?.comment === comment.comment)}
                                        InputProps={{ disableUnderline: (isEditComment && selectedComment?.comment === comment.comment) ? false : true }}
                                        onChange={(e) => setUpdatedComment(e.target.value)}
                                    />
                                </Box>

                                {/* edit and delete comment options */}
                                {
                                    comment.userId === _id && (
                                        <>
                                            {(isEditComment && selectedComment?.comment === comment.comment) ? <>
                                                <IconButton onClick={handleEditComment}>
                                                    <ModeEdit />
                                                </IconButton>
                                                <IconButton onClick={handleCancelEditComment}>
                                                    <Cancel />
                                                </IconButton>
                                            </> :
                                                <>
                                                    <IconButton
                                                        aria-label="more"
                                                        aria-controls={open ? 'long-menu' : undefined}
                                                        aria-expanded={open ? 'true' : undefined}
                                                        aria-haspopup="true"
                                                        onClick={(event) => handleClick(event, comment)}
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
                                                        {/* edit comment */}
                                                        <MenuItem onClick={handleOpenEditComment}>
                                                            <ListItemIcon>
                                                                <Edit />
                                                            </ListItemIcon>
                                                            <Typography variant="inherit">Edit</Typography>
                                                        </MenuItem>
                                                        {/* delete comment */}
                                                        <MenuItem onClick={handleDeleteComment}>
                                                            <ListItemIcon>
                                                                <Delete />
                                                            </ListItemIcon>
                                                            <Typography variant="inherit">Delete</Typography>
                                                        </MenuItem>
                                                    </Menu>
                                                </>}
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