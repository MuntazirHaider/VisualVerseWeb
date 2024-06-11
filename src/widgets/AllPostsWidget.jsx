// react
import { useEffect } from "react";
// state
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";
// routes
import RestApiClient from "routes/RestApiClient";
import Apis from "routes/apis";
// widgets
import UserPostsWidget from './UserPostsWidget';

const AllPostsWidget = ({ userId, isProfile = false }) => {
  const dispatch = useDispatch();

  const posts = useSelector((state) => state.posts);
  const token = useSelector((state) => state.token);

  const api = new RestApiClient(token);

  // get all post
  const getPosts = async () => {
    const response = await api.get(Apis.post.index);
    if (response.result) {
      dispatch(setPosts({ posts: response.posts }));
    }
  }

  // get post by id 
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
  }, [])

  return (
    <>
      {posts &&
        <>{posts.map(
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
              mediaType = {mediaType}
              media={picturePath}
              userPicturePath={userPicturePath}
              likes={likes}
              comments={comments}
              getPosts={getPosts}
            />
          )
        )}
        </>
      }
    </>
  )
}

export default AllPostsWidget;