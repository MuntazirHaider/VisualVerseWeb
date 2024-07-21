import { useEffect } from "react";
// state
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";
// routes
import RestApiClient from "routes/RestApiClient";
import Apis from "routes/apis";
// components
import UserPostsWidget from './UserPostsWidget';
// import WidgetWrapper from "components/WidgetWrapper";
// @mui
// import {
//   IconButton,
//   ImageList,
//   ImageListItem,
//   ImageListItemBar,
//   ListSubheader
// } from "@mui/material";
// icons
// import InfoIcon from '@mui/icons-material/Info';

const AllPostsWidget = ({ userId, isProfile = false }) => {

  const posts = useSelector((state) => state.posts);
  const token = useSelector((state) => state.token);

  const dispatch = useDispatch();
  const api = new RestApiClient(token);

  // get all posts
  const getPosts = async () => {
    const response = await api.get(Apis.post.index);
    if (response.result) {
      dispatch(setPosts({ posts: response.posts }));
    }
  }

  // get all posts of specific user
  const getUserPosts = async () => {
    const response = await api.get(`${Apis.post.index}/${userId}`);
    if (response.result) {
      dispatch(setPosts({ posts: response.posts }));
    }
  }

  useEffect(() => {
    if (isProfile) {
      getUserPosts();
    } else {
      getPosts();
    }
    // eslint-disable-next-line
  }, [isProfile, userId]);

  return (
    <>
      {posts && (
        // isProfile ? (
        //   // for profile page
        //   <WidgetWrapper>
        //     <ImageList sx={{ width: '100%', height: 650 }}>
        //       {/* heading */}
        //       <ImageListItem key="Subheader" cols={2}>
        //         <ListSubheader component="div">All Posts</ListSubheader>
        //       </ImageListItem>
        //       {/* list all posts */}
        //       {posts.map((item) => (
        //         <ImageListItem key={item._id}>
        //           {/* display media */}
        //           {item.picturePath && (item.mediaType === 'image' ? (
        //             <img
        //               srcSet={`${item.picturePath}?w=248&fit=crop&auto=format&dpr=2 2x`}
        //               src={`${item.picturePath}?w=248&fit=crop&auto=format`}
        //               alt={item.firstName}
        //               loading="lazy"
        //             />
        //           ) : (
        //             <video
        //               height="auto"
        //               style={{ maxHeight: "600px", width: "100%" }}
        //               src={item.picturePath}
        //               alt="post"
        //               autoPlay
        //               loop
        //               muted
        //               controls
        //             />
        //           ))}
        //           {/* other post info */}
        //           <ImageListItemBar
        //             title={item?.description}
        //             subtitle={<span>
        //               <br />
        //               likes: {(Object.keys(item.likes).length) || 0} <br /> <br />
        //               comments: {item.comments.length}
        //             </span>}
        //             actionIcon={
        //               <IconButton
        //                 sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
        //                 aria-label={`info about ${item.firstName}`}
        //               >
        //                 <InfoIcon />
        //               </IconButton>
        //             }
        //           />
        //         </ImageListItem>
        //       ))}
        //     </ImageList>
        //   </WidgetWrapper>
        // ) : 
        // (
          // list all posts for home page
          posts.map(
            ({
              _id,
              userId,
              firstName,
              middleName,
              lastName,
              description,
              mediaType,
              picturePath,
              userPicturePath,
              likes,
              comments
            }) => (
              <UserPostsWidget
                key={_id}
                postId={_id}
                postUserId={userId}
                fullName={`${firstName} ${middleName} ${lastName}`}
                description={description}
                mediaType={mediaType}
                media={picturePath}
                userPicturePath={userPicturePath}
                likes={likes}
                comments={comments}
                getPosts={getPosts}
              />
            )
          // )
        )
      )}
    </>
  )
}

export default AllPostsWidget;
