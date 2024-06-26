import { Box, useMediaQuery } from '@mui/material';
import Navbar from 'pages/navbar';
import UserWidget from 'widgets/UserWidget';
import MyPostWidget from 'widgets/MyPostWidget';
import React from 'react'
import { useSelector } from 'react-redux';
import AdvertisementWidget from 'widgets/AdvertisementWidget';
import FriendListWidget from 'widgets/FriendListWidget';
import AllPostsWidget from 'widgets/AllPostsWidget';

const Home = () => {
  const isNonMobScreens = useMediaQuery("(min-width: 1000px)");
  const { _id, picturePath } = useSelector((state) => state.user);
  const friends = useSelector((state) => state.user.friends);

  return (
    <Box >
      <Navbar userId={_id} picturePath={picturePath} />
      <Box
        width="100%"
        padding="2rem 6%"
        display={isNonMobScreens ? "flex" : "block"}
        gap="0.5rem"
        justifyContent="space-between"
      >
        <Box flexBasis={isNonMobScreens ? "26%" : undefined}>
          <UserWidget userId={_id} />
        </Box>

        <Box flexBasis={isNonMobScreens ? "42%" : undefined} mt={isNonMobScreens ? undefined : "2rem"}>
          <MyPostWidget picturePath={picturePath} />
          <AllPostsWidget userId={_id} />
        </Box>

        {isNonMobScreens && (
          <Box flexBasis="26%">
            <Box sx={{ mb: "15px" }}>
              <AdvertisementWidget />
            </Box>
            {friends.length !== 0 && <FriendListWidget userId={_id} />}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default Home;