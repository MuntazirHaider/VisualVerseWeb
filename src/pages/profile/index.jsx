import { useEffect, useState } from "react";
// @mui
import { Box, useMediaQuery } from "@mui/material";
// redux
import { useSelector } from "react-redux";
// page
import Navbar from "pages/navbar";
// widgets
import FriendListWidget from "widgets/FriendListWidget";
import UserWidget from "widgets/UserWidget";
import AllPostsWidget from "widgets/AllPostsWidget";
// routes
import RestApiClient from "routes/RestApiClient";
import { useParams } from "react-router-dom";
import Apis from "routes/apis";

const Profile = () => {
  const [user, setUser] = useState(null);
  const { userId } = useParams();
  const token = useSelector((state) => state.token);
  const { _id, picturePath } = useSelector((state) => state.user);
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  const api = new RestApiClient(token);

  const getUser = async () => {
    const response = await api.get(`${Apis.user.index}/${userId}`);
    if (response.result) {
      setUser(response.data);
    }
  }

  useEffect(() => {
    getUser();
    // eslint-disable-next-line
  }, []);

  if (!user) return null;

  return (
    <Box>
      <Navbar userId={_id} picturePath={picturePath}/>
      <Box
        width="100%"
        padding="2rem 6%"
        display={isNonMobileScreens ? "flex" : "block"}
        gap="2rem"
        justifyContent="center"
      >
        <Box flexBasis={isNonMobileScreens ? "26%" : undefined}>
          <UserWidget userId={userId} picturePath={user.picturePath} />
          <Box m="2rem 0" />
          {(user.friends && user.friends.length > 0) && (< FriendListWidget userId={userId} />)}
        </Box>

        <Box flexBasis={isNonMobileScreens ? "42%" : undefined}>
          <AllPostsWidget userId={userId} isProfile />
        </Box>

      </Box>
    </Box>
  )
}

export default Profile;