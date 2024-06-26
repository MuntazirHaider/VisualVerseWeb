import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "light",
  user: null,
  token: null,
  posts: [],
  chats: [],
  notifications: [],
  selectedChat: null
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null;
      state.socket = null;
    },
    setUser: (state, action) => {
      state.user = action.payload.user;
    },
    setFriends: (state, action) => {
      if (state.user) {
        state.user.friends = action.payload.friends;
      } else {
        console.error("user friends non-existent :(");
      }
    },
    setPosts: (state, action) => {
      state.posts = action.payload.posts;
    },
    setPost: (state, action) => {
      const updatedPosts = state.posts.map((post) => {
        if (post._id === action.payload.post._id) return action.payload.post;
        return post;
      });
      state.posts = updatedPosts;
    },
    setChats: (state, action) => {
      state.chats = action.payload.chats;
    },
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload.selectedChat;
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload.notifications;
    },
  },
});

export const {
  setMode,
  setLogin,
  setLogout,
  setUser,
  setFriends,
  setPosts,
  setPost,
  setChats,
  setSelectedChat,
  setNotifications,
} = authSlice.actions;
export default authSlice.reducer;
