// import { API_HOST } from "src/config-global";
const API_HOST = process.env.REACT_APP_API_URL ?? "http://localhost:3001/api/";
const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const MEDIA_HOST = process.env.REACT_APP_STORAGE_URL ?? `https://api.cloudinary.com/v1_1/`;

function path(sublink) {
  return `${API_HOST}${sublink}`;
}

function mediaPath(sublink) {
  return `${MEDIA_HOST}${sublink}`;
}

const Apis = {
  post: {
    index: path('posts'),
  },
  upload: {
    image: mediaPath(`/${cloudName}/image/upload`),
    video: mediaPath(`/${cloudName}/video/upload`),
  },
  auth: {
    login: path('auth/login'),
    register: path('auth/register')
  },
  user: {
    index: path('users'),
    update: path('users/update')
  },
  chats: {
    index: path('chats'),
    search: path('chats/search'),
  },
  group: {
    index: path('chats/groupChat'),
    update: path('chats/groupChat/update'),
    remove: path('chats/groupChat/remove'),
  },
  messages: {
    index: path('messages'),
  },
  notifications: {
    index: path('notifications')
  }


};

export default Apis;