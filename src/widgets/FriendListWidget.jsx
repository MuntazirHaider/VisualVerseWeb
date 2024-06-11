// @mui
import { Box, Typography, useTheme } from "@mui/material";
// components
import Friends from "components/Friends";
import WidgetWrapper from "components/WidgetWrapper";
// react
import { useEffect } from "react";
// routes
import RestApiClient from "routes/RestApiClient";
import Apis from "routes/apis";
// state
import { useDispatch, useSelector } from "react-redux"
import { setFriends } from "state";

const FriendListWidget = ({ userId }) => {
    const dispatch = useDispatch();

    const token = useSelector((state) => state.token);
    const friends = useSelector((state) => state.user.friends);

    const api = new RestApiClient(token);
    
    const { palette } = useTheme();
    const dark = palette.neutral.dark;

    // get user friends by id
    const getFriends = async () => {
        const response = await api.get(`${Apis.user.index}/${userId}/friends`);
        if (response.result) {
            dispatch(setFriends({ friends: response.friends }));
        }
    }

    useEffect(() => {
        getFriends();
        // eslint-disable-next-line
    }, []);


    return (
        <WidgetWrapper>
            <Typography color={dark} variant="h5" fontWeight="500" sx={{ mb: "1.5rem" }}>
                Friends List
            </Typography>
            <Box display="flex" flexDirection="column" gap="1.5rem">
                {friends.length > 0 && (
                    friends.map((friend) => (
                        <Friends
                            key={friend._id}
                            friendId={friend._id}
                            name={`${friend.firstName} ${friend.middleName} ${friend.lastName}`}
                            subtitle={friend.occupation}
                            userPicturePath={friend.picturePath}
                        />
                    ))
                )}
            </Box>
        </WidgetWrapper>
    )
}

export default FriendListWidget