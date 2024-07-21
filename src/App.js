// @react
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// utils
import { playIncomingRingtone, pauseIncomingRingtone } from 'utils/SoundUtils.js';
// Theme settings
import { themeSettings } from './theme.js';
// state
import { useSocket } from 'context/SocketContext.js';
import { setOnlineUsers } from 'state/index.js';
// Components
import Loading from 'components/Loading.jsx';
import IncomingCallModalWidget from 'widgets/IncomingCallModalWidget.jsx';
// Pages
const Home = lazy(() => import('pages/home'));
const Chat = lazy(() => import('pages/chat'));
const LogIn = lazy(() => import('pages/auth/index.jsx'));
const Profile = lazy(() => import('pages/profile'));
const ForgetPassword = lazy(() => import('pages/auth/ForgetPassword.jsx'));
// const IncomingCallModalWidget = lazy(() => import('widgets/IncomingCallModalWidget.jsx'));
const HelpWidget = lazy(() => import('widgets/HelpWidget.jsx'));
const Navbar = lazy(() => import('pages/navbar/index.jsx'));
const VideoChat = lazy(() => import('pages/video/index.jsx'));


function App() {

  const { socket, connectSocket, disconnectSocket, setUserForVideoCall, setCall } = useSocket();

  const mode = useSelector((state) => state.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  const token = useSelector((state) => state.token);
  const isAuth = Boolean(useSelector((state) => state.token));
  const user = useSelector((state) => state?.user);

  const [openIncomingCallDialog, setOpenIncomingCallDialog] = useState(false);   /* for toggling group modal */

  const _id = user ? user._id : null;
  const picturePath = user ? user.picturePath : null;

  const dispatch = useDispatch();

  // function to toggle incoming call modal
  const handleOpen = () => {
    setOpenIncomingCallDialog(true);
    playIncomingRingtone();
  };

  const handleClose = () => {
    setOpenIncomingCallDialog(false);
    pauseIncomingRingtone();
  };

  useEffect(() => {
    if (isAuth && socket) {
      socket.emit('user: connected', _id);
      setUserForVideoCall();
    } else if (isAuth && !socket) {
      connectSocket(token);
      setUserForVideoCall();
    }
    return () => {
      disconnectSocket();
    }
    // eslint-disable-next-line
  }, [isAuth, socket]);

  useEffect(() => {
    socket?.on('user: status', (status) => {
      dispatch(setOnlineUsers(status));
    })

    socket?.on('video call: received call', ({ caller, signal }) => {
      setCall({ isReceivedCall: true, caller, signal });
      handleOpen();
    })

    socket?.on('video call: call cancelled', () => {
      setCall({ isReceivedCall: false });
      handleClose();
    })

    return () => {
      socket?.off('user: status');
    }
  })

  return (
    <div className="App">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Suspense fallback={<Loading />}>
            {isAuth && <Navbar userId={_id} picturePath={picturePath} />}
            <Routes>
              <Route path="/" element={isAuth ? <Home /> : <Navigate to="/login" />} />
              <Route path="/login" element={!isAuth ? <LogIn /> : <Navigate to="/" />} />
              <Route path="/home" element={isAuth ? <Home /> : <Navigate to="/login" />} />
              <Route path="/profile/:userId" element={isAuth ? <Profile /> : <Navigate to="/login" />} />
              <Route path="/chats" element={isAuth ? <Chat /> : <Navigate to="/login" />} />
              <Route path="/video-call" element={isAuth ? <VideoChat /> : <Navigate to="/login" />} />
              <Route path="/forget-password" element={<ForgetPassword mode={mode} />} />
              <Route path="/help" element={<HelpWidget />} />
            </Routes>
          </Suspense>
        </ThemeProvider>
        <IncomingCallModalWidget open={openIncomingCallDialog} onClose={handleClose} />
      </BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={mode === "light" ? "light" : "dark"}
      />
    </div >
  );
}

export default App;