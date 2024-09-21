import { useEffect, useState } from "react";
// @mui
import {
  Box,
  useMediaQuery
} from "@mui/material";
// redux
import { useSelector } from "react-redux";
// components
import FriendListWidget from "widgets/FriendListWidget";
import UserWidget from "widgets/UserWidget";
import AllPostsWidget from "widgets/AllPostsWidget";
// routes
import RestApiClient from "routes/RestApiClient";
import { useParams } from "react-router-dom";
import Apis from "routes/apis";

const Profile = () => {

  const [user, setUser] = useState(null);    /* for user of this profile */

  const token = useSelector((state) => state.token);

  const { userId } = useParams();           /* id of user which profile should display */
  const api = new RestApiClient(token);
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");


  // get user by id
  const getUser = async () => {
    const response = await api.get(`${Apis.user.index}/${userId}`);
    if (response.result) {
      setUser(response.data);
    }
  }

  useEffect(() => {
    getUser();
    // eslint-disable-next-line
  }, [userId]);

  return (
    <Box>

      <Box
        width="100%"
        padding="2rem 6%"
        display={isNonMobileScreens ? "flex" : "block"}
        gap="2rem"
        justifyContent="center"
      >

        {/* left side */}
        <Box flexBasis={isNonMobileScreens ? "32%" : undefined}>

          {/* user details */}
          <UserWidget userId={userId} picturePath={user?.picturePath} isProfile/>
          <Box m="2rem 0" />
          {/* user firnds's detail */}
          {user?.friends?.length > 0 && < FriendListWidget userId={userId} isProfile/>}
          <Box m="2rem 2rem" />
        </Box>

        {/* right side */}
        <Box flexBasis={isNonMobileScreens ? "50%" : undefined}>
          {/* all post */}
          <AllPostsWidget userId={userId} isProfile />
        </Box>
      </Box>

    </Box>
  )
}

export default Profile;