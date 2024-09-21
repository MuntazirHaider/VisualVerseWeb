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

const FriendListWidget = ({ userId, isProfile }) => {

    const token = useSelector((state) => state.token);
    let { _id, friends } = useSelector((state) => state.user);

    const [showMore, setShowMore] = useState(false);
    const [userFriends, setUserFriends] = useState([]);                   /* to expand a friend list */
    let visibleFriends;

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
            setUserFriends(response.friends);
        }
    }

    useEffect(() => {
        if (isProfile)
            getFriends();
        // eslint-disable-next-line
    }, []);

    if (isProfile) {
        friends = userFriends
    }
    visibleFriends = showMore ? friends : friends.slice(0, 3);     /* limit the number of visible friends */

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
                            isMyProfile={_id === userId ? true : false}
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