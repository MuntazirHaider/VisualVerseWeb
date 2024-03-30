// react
import { useEffect } from "react";
// state
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";
// widgets
import UserPostsWidget from './UserPostsWidget';

const AllPostsWidget = ({ userId, isProfile = false }) => {
  const dispatch = useDispatch();

  const posts = useSelector((state) => state.posts);
  const token = useSelector((state) => state.token);

  
  // get all post
  const getPosts = async () => {
    const response = await fetch("http://localhost:3001/posts", {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    const data = await response.json();
    dispatch(setPosts({posts: data.posts}));
  }

  // get post by id 
  const getUserPosts = async () => {
    const response = await fetch(`http://localhost:3001/posts/${userId}/posts`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    const data = await response.json();
    dispatch(setPosts({posts: data.posts}));
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
          // location,
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
            // location = {location}
            picture={picturePath}
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