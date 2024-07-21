import React from 'react'
import { advertisement } from "assets/advertisement"
// @mui
import {
  Box,
  useMediaQuery
} from '@mui/material';
// components
import UserWidget from 'widgets/UserWidget';
import MyPostWidget from 'widgets/MyPostWidget';
import AdvertisementWidget from 'widgets/AdvertisementWidget';
import FriendListWidget from 'widgets/FriendListWidget';
import AllPostsWidget from 'widgets/AllPostsWidget';
// redux
import { useSelector } from 'react-redux';

const Home = () => {

  const isNonMobScreens = useMediaQuery("(min-width: 1000px)");
  const { _id, picturePath, friends } = useSelector((state) => state.user);

  return (
    <Box>
      <Box
        width="100%"
        padding="2rem 6%"
        display={isNonMobScreens ? "flex" : "block"}
        gap="0.5rem"
        justifyContent="space-between"
      >
        {/* left side */}
        <Box flexBasis={isNonMobScreens ? "26%" : undefined}>
          {/* for logged in user details */}
          <UserWidget userId={_id} />
        </Box>

        {/* center  */}
        <Box flexBasis={isNonMobScreens ? "42%" : undefined} mt={isNonMobScreens ? undefined : "2rem"}>
          {/* for posting new post and accessing chat and video call */}
          <MyPostWidget picturePath={picturePath} _id={_id} />
          {/* for listing all post */}
          <AllPostsWidget userId={_id} />
        </Box>

        {/* right side Only for desktop */}
        {isNonMobScreens && (
          <Box flexBasis="26%">
            <Box sx={{ mb: "15px" }}>
              {/* for advertisement  */}
              <AdvertisementWidget advertisement={advertisement} />
            </Box>
            {/* list of friends */}
            {friends.length !== 0 && <FriendListWidget userId={_id} />}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default React.memo(Home);