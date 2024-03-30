// Icons
import {
    ManageAccountsOutlined,
    LocationOnOutlined,
    WorkOutlineOutlined
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
// react
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// widgets
import UpdateProfilePage from "pages/widgets/UpdateProfileWidget";

const UserWidget = (props) => {
    const { userId, picturePath } = props;
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const token = useSelector((state) => state.token);
    const currUser = useSelector((state) => state.user);
    const posts = useSelector((state) => state.posts);

    const { palette } = useTheme();
    const dark = palette.neutral.dark;
    const medium = palette.neutral.medium;
    const main = palette.neutral.main;

    const [openUpdateDialog, setOpenUpdateDialog] = useState(false);

    const handleClickOpen = () => {
        setOpenUpdateDialog(true);
    };

    const handleClose = () => {
        setOpenUpdateDialog(false);
    };

    const isLoggedInUser = userId === currUser._id;

    // Get user by id
    const getUser = async () => {
        const response = await fetch(`http://localhost:3001/users/${userId}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        setUser(data);
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
                <FlexBetween gap="1rem" onClick={() => navigate(`/profile/${userId}`)}>
                    <UserImage image={picturePath} />
                    <Box>
                        <Typography
                            variant="h4"
                            color={dark}
                            fontWeight="500"
                            sx={{
                                "&:hover": {
                                    color: palette.primary.light,
                                    cursor: "pointer"
                                }
                            }}
                        >
                            {firstName} {middleName} {lastName}
                        </Typography>
                        <Typography color={medium}>{(friends.length) || 0} friends</Typography>
                    </Box>
                </FlexBetween>
                {isLoggedInUser && <IconButton> <ManageAccountsOutlined onClick={handleClickOpen} sx={{ cursor: "pointer" }} /></IconButton>}
            </FlexBetween>


            {/* SECOND ROW */}
            {
                (location || occupation) && (
                    <>
                    <Divider />
                    <Box p="1rem 0">
                        {location && (
                            <Box display="flex" alignItems="center" gap="1rem" mb="0.5rem">
                                <LocationOnOutlined fontSize="large" sx={{ color: main }} />
                                <Typography color={medium}>{location}</Typography>
                            </Box>
                        )}
                        {occupation && (
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
                    <Typography color={medium}>Posts</Typography>
                    <Typography color={main} fontWeight="500">{totalPosts}</Typography>
                </FlexBetween>
                <FlexBetween>
                    <Typography color={medium}>Impressions of posts</Typography>
                    <Typography color={main} fontWeight="500">{impressions}</Typography>
                </FlexBetween>
            </Box>
            <UpdateProfilePage currentProfile={user} onClose={handleClose} open={openUpdateDialog} getUser={getUser} />
        </WidgetWrapper>
    )
}

export default UserWidget;