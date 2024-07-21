// @mui
import {
    Box,
    Typography,
    useTheme,
    Badge
} from "@mui/material";
// components
import UserImage from "../components/UserImage";
import FlexBetween from "components/FlexBetween";
// state
import { useSelector } from "react-redux";

const UserChatWidget = ({ userId, name, picturePath, lastMessage = "", lastMessageType = "text", isChatList, handleSelectUser, notification }) => {

    const onlineUsers = useSelector((state) => state.onlineUsers);
    const { palette } = useTheme();

    // variable
    let isOnline = false;
    if (isChatList && onlineUsers.includes(userId)) {
        isOnline = true;
    }

    // colors
    const main = palette.neutral.main;
    const medium = palette.neutral.medium;
    const light = palette.primary.light;

    return (
        <FlexBetween onClick={handleSelectUser}>
            <Box display='flex' alignItems='center' gap="0.5rem" >
                {/* user or group image */}
                <Badge color="success" variant="dot" badgeContent='' overlap="circular" invisible={!isOnline}>
                    <UserImage image={picturePath} size={isChatList ? "55px" : "45px"} />
                </Badge>
                {/* user or group name and last message */}
                <Box>
                    <Typography
                        color={main}
                        variant={isChatList ? "h5" : "h6"}
                        fontWeight="500"
                        sx={{
                            "&:hover": {
                                color: light,
                                cursor: "pointer"
                            }
                        }}
                    >
                        {name}
                    </Typography>
                    {lastMessageType === 'text' ? <Typography color={medium} fontSize="0.75rem">
                        {lastMessage.length > 20 ? `${lastMessage.substring(0, 20)}...` : lastMessage}
                    </Typography> : lastMessageType === 'image' ? <Typography color={medium} fontSize="0.75rem">
                        image
                    </Typography> : lastMessageType === 'video' ? <Typography color={medium} fontSize="0.75rem">
                        video
                    </Typography> : lastMessageType === 'audio' ? <Typography color={medium} fontSize="0.75rem">
                        audio
                    </Typography> : lastMessageType === 'document' ? <Typography color={medium} fontSize="0.75rem">
                        document
                    </Typography> : ''}
                </Box>
            </Box>

            {(isChatList && notification > 0) && (
                <Badge color='error' badgeContent={notification}></Badge>
            )}

        </FlexBetween>
    )
}

export default UserChatWidget;