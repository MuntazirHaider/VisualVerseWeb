// @mui
import { Box, Button, Typography, useTheme } from "@mui/material";
// components
import Friends from "components/Friends";
import WidgetWrapper from "components/WidgetWrapper";
// react
import { useEffect, useState } from "react";
// routes
import RestApiClient from "routes/RestApiClient";
import Apis from "routes/apis";
// state
import { useDispatch, useSelector } from "react-redux"
import { setFriends } from "state";
// icons
import {
    ArrowDropUp,
    ArrowDropDown,
} from '@mui/icons-material';

const FriendListWidget = ({ userId }) => {

    const token = useSelector((state) => state.token);
    const friends = useSelector((state) => state.user.friends);

    const [showMore, setShowMore] = useState(false);                     /* to expand a friend list */
    const visibleFriends = showMore ? friends : friends.slice(0, 3);     /* limit the number of visible friends */

    const dispatch = useDispatch();
    const { palette } = useTheme();
    const api = new RestApiClient(token);

    // colors
    const dark = palette.neutral.dark;

    // function to toggle the show more functionality
    const handleToggleShowMore = () => {
        setShowMore(!showMore);
    };

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
        <WidgetWrapper >
            {/* heading */}
            <Typography color={dark} variant="h5" fontWeight="500" sx={{ mb: "1.5rem" }}>
                Friends List
            </Typography>

            {/* list all friends */}
            <Box display="flex" flexDirection="column" gap="1.5rem">
                {friends?.length > 0 && (
                    visibleFriends.map((friend) => (
                        <Friends
                            key={friend._id}
                            friendId={friend._id}
                            name={`${friend.firstName} ${friend.middleName} ${friend.lastName}`}
                            subtitle={friend.occupation}
                            userPicturePath={friend.picturePath}
                        />
                    ))
                )}
                {friends.length > 3 && (
                    <Button
                        endIcon={showMore ? <ArrowDropUp /> : <ArrowDropDown />}
                        onClick={handleToggleShowMore}
                    >
                        {showMore ? 'Show Less' : 'Show More'}
                    </Button>
                )}
            </Box>

        </WidgetWrapper>
    )
}

export default FriendListWidget