// @mui
import { Box, Typography, useTheme } from "@mui/material";
// components
import Friends from "components/Friends";
import WidgetWrapper from "components/WidgetWrapper";
// react
import { useEffect } from "react";
// state
import { useDispatch, useSelector } from "react-redux"
import { setFriends } from "state";

const FriendListWidget = ({ userId }) => {
    const dispatch = useDispatch();

    const token = useSelector((state) => state.token);
    const friends = useSelector((state) => state.user.friends);
    
    const { palette } = useTheme();
    const dark = palette.neutral.dark;

    // get user friends by id
    const getFriends = async () => {
        const response = await fetch(`http://localhost:3001/users/${userId}/friends`, {
    method: "GET",
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
});

        const data = await response.json();
        dispatch(setFriends({ friends: data.formattedFriends }));
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