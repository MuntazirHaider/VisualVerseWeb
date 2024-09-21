// Icons
import {
    ManageAccountsOutlined,
    LocationOnOutlined,
    WorkOutlineOutlined,
    PersonAddOutlined,
    PersonRemoveOutlined,
} from "@mui/icons-material"
// @mui
import {
    Box,
    Typography,
    Divider,
    useTheme,
    IconButton,
} from "@mui/material";
// components
import UserImage from "components/UserImage";
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";
import UpdateProfilePage from "widgets/UpdateProfileWidget";
import PreviewImage from "components/PreviewImage";
// state
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "context/SocketContext";
// routes
import Apis from "routes/apis";
import RestApiClient from "routes/RestApiClient";
import { setFriends } from "state";
// utils
import { toast } from "react-toastify";

const UserWidget = ({ userId, isProfile }) => {

    const [user, setUser] = useState(null);                            /* for storing curr user */
    const [openUpdateDialog, setOpenUpdateDialog] = useState(false);  /* for storing update modal state */
    const [imagePreview, setImagePreview] = useState(false);         /* flag for image preview modal */

    const token = useSelector((state) => state.token);
    const currUser = useSelector((state) => state.user);
    const posts = useSelector((state) => state.posts);
    const onlineUsers = useSelector((state) => state.onlineUsers);
    const userFriends = currUser.friends || [];

    const navigate = useNavigate();
    const { palette } = useTheme();
    const { socket } = useSocket();
    const dispatch = useDispatch();
    const api = new RestApiClient(token);

    // colors
    const dark = palette.neutral.dark;
    const medium = palette.neutral.medium;
    const main = palette.neutral.main;
    const primaryLight = palette.primary.light
    const primaryDark = palette.primary.dark;

    // variable
    const isFriends = userFriends.find((friend) => friend._id === userId) !== undefined;

    // function to toggle user update and image preview modal
    const handleClickOpen = () => {
        setOpenUpdateDialog(true);
    };

    const handleClose = () => {
        setOpenUpdateDialog(false);
    };

    const handleOpenImagePreview = () => {
        if (isProfile)
            setImagePreview(true);
    }

    const handleCloseImagePreview = () => {
        setImagePreview(false);
    }

    const isLoggedInUser = userId === currUser._id;    /* whether curr user is logged in user or not */

    // Get user by id
    const getUser = async () => {
        const response = await api.get(`${Apis.user.index}/${userId}`);
        if (response.result) {
            setUser(response.data);
        }
    }

    // add or remove friend
    const addFriend = async () => {
        const response = await api.post(`${Apis.friendRequest.send}/${userId}`, { "requesterId": currUser._id });
        if (response.result) {
            if (onlineUsers.includes(userId)) {
                socket.emit("friend request: send requested", response.data);
            }
            toast.success("Friend request sent successfully");
        } else {
            toast.error(response.message);
        }
    }

    const removeFriend = async () => {
        const response = await api.delete(`${Apis.friendRequest.index}/${currUser._id}/${userId}`);
        if (response.result) {
            dispatch(setFriends({ friends: response.data }));
        } else {
            toast.error(response.message);
        }
    }

    useEffect(() => {
        getUser()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, currUser, posts])

    if (!user) return null;

    const {
        firstName,
        middleName,
        lastName,
        picturePath,
        occupation,
        location,
        totalPosts,
        impressions,
        friends
    } = user;

    return (
        <WidgetWrapper>
            {/* FIRST ROW */}
            <FlexBetween
                gap="0.5rem"
                pb="1rem"
            >
                <FlexBetween gap="1rem" >
                    {/*  profile picture */}
                    <IconButton sx={{ p: 0, m: 0 }} onClick={handleOpenImagePreview}>
                        <UserImage image={picturePath} />
                    </IconButton>
                    <Box onClick={() => navigate(`/profile/${userId}`)}>
                        {/* full name */}
                        <Typography
                            variant="h4"
                            color={dark}
                            fontWeight="500"
                            sx={{
                                "&:hover": {
                                    color: primaryLight,
                                    cursor: "pointer"
                                }
                            }}
                        >
                            {firstName} {middleName} {lastName}
                        </Typography>
                        {/* count of friends */}
                        <Typography color={medium}>{(friends.length) || 0} friends</Typography>
                    </Box>
                </FlexBetween>
                {/* icons for update profile modal */}
                {isLoggedInUser ?
                    (<IconButton onClick={handleClickOpen}>
                        <ManageAccountsOutlined sx={{ cursor: "pointer" }} />
                    </IconButton>
                    ) : (
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
                    )
                }
            </FlexBetween>


            {/* SECOND ROW */}
            {
                (location || occupation) && (
                    <>
                        <Divider />
                        <Box p="1rem 0">
                            {/* display location */}
                            {location && (
                                <Box display="flex" alignItems="center" gap="1rem" mb="0.5rem">
                                    <LocationOnOutlined fontSize="large" sx={{ color: main }} />
                                    <Typography color={medium}>{location}</Typography>
                                </Box>
                            )}
                            {occupation && (
                                // display occupation
                                <Box display="flex" alignItems="center" gap="1rem" mb="0.5rem">
                                    <WorkOutlineOutlined fontSize="large" sx={{ color: main }} />
                                    <Typography color={medium}>{occupation}</Typography>
                                </Box>
                            )}
                        </Box>
                    </>
                )
            }

            <Divider />

            {/* THIRD ROW */}
            <Box p="1rem 0">
                <FlexBetween mb="0.5rem">
                    {/* display total number of posts */}
                    <Typography color={medium}>Posts</Typography>
                    <Typography color={main} fontWeight="500">{totalPosts}</Typography>
                </FlexBetween>
                <FlexBetween>
                    {/* display total number of likes */}
                    <Typography color={medium}>Impressions of posts</Typography>
                    <Typography color={main} fontWeight="500">{impressions}</Typography>
                </FlexBetween>
            </Box>

            {/* update profile modal */}
            <UpdateProfilePage currentProfile={user} onClose={handleClose} open={openUpdateDialog} getUser={getUser} />

            {/* Modal for image preview */}
            <PreviewImage open={imagePreview} handleClosePreview={handleCloseImagePreview} img={picturePath} />
        </WidgetWrapper>
    )
}

export default UserWidget;