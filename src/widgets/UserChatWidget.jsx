// @mui
import { Box, Typography, useTheme} from "@mui/material";
// components
import UserImage from "../components/UserImage";

const UserChatWidget = ({ name, picturePath, lastMessage = "", isChatList, handleSelectUser }) => {
    
    const { palette } = useTheme();

    const main = palette.neutral.main;
    const medium = palette.neutral.medium;

    const hadleNothing = () => {}

    return (
        <Box display="flex" gap="0.5rem" alignItems="center" onClick={isChatList ? hadleNothing : handleSelectUser}>
            <UserImage image={picturePath} size={isChatList ? "55px" : "45px"} />
            <Box>
                <Typography
                    color={main}
                    variant={isChatList ? "h5" : "h6"}
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
                    {lastMessage}
                </Typography>
            </Box>
        </Box>
    )
}

export default UserChatWidget;