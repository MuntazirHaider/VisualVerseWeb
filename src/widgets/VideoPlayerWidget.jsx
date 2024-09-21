// react
import React, { useEffect, useState } from 'react';
// @mui
import { Grid, IconButton, Paper, Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/system';
// icons
import { Mic, MicOff, Videocam, VideocamOff, CallEnd, Call, West, FlipCameraAndroid } from '@mui/icons-material';
// state
import { useSocket } from 'context/SocketContext.js';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedVideoChat } from 'state';
// utils
import { playOutgoingRingtone, pauseOutgoingRingtone, playCallEnded } from 'utils/SoundUtils';
// component
import OutgoingCallModalWidget from './OutgoingCallModalWidget';

// custom style wrapper
const VideoContainer = styled(Grid)(({ theme }) => ({
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    position: 'relative',
    [theme.breakpoints.down('xs')]: {
        flexDirection: 'column',
    },
}));

const VideoPaper = styled(Paper)(({ theme }) => ({
    position: 'relative',
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    [theme.breakpoints.down('xs')]: {
        width: '100%',
        height: '100%'
    },
}));

const VideoElement = styled('video')(({ theme }) => ({
    height: '98%',
    width: '98%',
    borderRadius: '8px',
    objectFit: 'cover',
    [theme.breakpoints.down('xs')]: {
        borderRadius: '0px',
    },
}));

const SmallVideoElement = styled('video')(({ theme }) => ({
    width: '150px',
    position: 'absolute',
    top: '10px',
    right: '10px',
    borderRadius: '8px',
    border: '2px solid white',
    zIndex: 10,
    [theme.breakpoints.down('xs')]: {
        width: '100px',
    },
}));

const ControlButtons = styled('div')({
    position: 'absolute',
    bottom: '30px',
    display: 'flex',
    gap: '10px',
    zIndex: 10,
});

const ControlBackButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    zIndex: 10,
    top: '20px',
    left: '20px',
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.6)',
    '&:hover': {
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
}));

const ControlIconButton = styled(IconButton)(({ theme }) => ({
    size: 'large',
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.6)',
    '&:hover': {
        backgroundColor: '#00D5FA',
    },
}));

const ControlCallIconButton = styled(IconButton)(({ theme }) => ({
    size: 'large',
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.6)',
    '&:hover': {
        backgroundColor: 'green',
    },
}));

const ControlEndCallIconButton = styled(IconButton)(({ theme }) => ({
    size: 'large',
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.6)',
    '&:hover': {
        backgroundColor: 'red',
    },
}));

const VideoPlayerWidget = () => {

    const selectedVideoChat = useSelector((state) => state.selectedVideoChat);
    const loggedInUser = useSelector((state) => state.user);

    const [openOutgoingCallDialog, setOpenOutgoingCallDialog] = useState(false);  // to toggle outgoing model
    const [videoDevices, setVideoDevices] = useState([]);                        // store all camera devides
    const [selectedDeviceId, setSelectedDeviceId] = useState('');                // selected camera device
    const [anchorEl, setAnchorEl] = useState(null);                              // menu for multiple cameras devices

    const {
        socket,
        callAccepted,
        myVideo,
        userVideo,
        callEnded,
        stream,
        setStream,
        toggleCamera,
        toggleMicrophone,
        callUser,
        endCall,
        cameraOn,
        microphoneOn
    } = useSocket();
    const dispatch = useDispatch();

    // function to decline incoming call
    const handleClose = () => {
        setOpenOutgoingCallDialog(false);
        pauseOutgoingRingtone();
    };

    // unselect user
    const handleGoBack = () => {
        dispatch(setSelectedVideoChat({ selectedVideoChat: null }));
    };

    // call a user
    const handleCallUser = () => {
        callUser(selectedVideoChat._id, loggedInUser);
        setOpenOutgoingCallDialog(true);
        playOutgoingRingtone();
    };

    // end video call
    const handleEndCall = () => {
        playCallEnded();
        endCall(selectedVideoChat._id);
    };

    // to change the camera
    const handleDeviceChange = async (deviceId) => {
        const currentStream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: deviceId } },
            audio: true,
        });
        setStream(currentStream);
        setSelectedDeviceId(deviceId);
        if (myVideo.current) {
            myVideo.current.srcObject = currentStream;
        }
        socket.emit('video call: camera-change', { stream: currentStream.id, to: selectedVideoChat._id });
        setAnchorEl(null);
    };

    // get all camera devices
    const getVideoDevices = async () => {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
        setVideoDevices(videoInputDevices);
        if (videoInputDevices.length > 0) {
            setSelectedDeviceId(videoInputDevices[0].deviceId);
        }
    };

    // toggle change camera menu
    const handleCameraMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCameraMenuClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                const checkAndSetMyVideo = setInterval(() => {
                    if (myVideo.current) {
                        myVideo.current.srcObject = currentStream;
                        clearInterval(checkAndSetMyVideo);
                    }
                }, 1000);
            });
        getVideoDevices();
        // eslint-disable-next-line
    }, [callAccepted, selectedVideoChat]);

    useEffect(() => {
        socket?.on('video call: call declined', () => {
            handleClose();
        });

        socket?.on('video call: camera-change', async ({ streamId }) => {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: videoInputDevices.find(device => device.deviceId === streamId)?.deviceId } },
                audio: true,
            });
            if (userVideo.current) {
                userVideo.current.srcObject = newStream;
            }
        });
        // eslint-disable-next-line
    }, [socket]);

    return (
        <VideoContainer container>
            {stream &&
                <VideoPaper>
                    {(!callAccepted && callEnded) && <ControlBackButton onClick={handleGoBack}>
                        <West />
                    </ControlBackButton>}

                    {/* my video player */}
                    {(callAccepted && !callEnded) && <SmallVideoElement playsInline muted ref={myVideo} autoPlay />}
                    {!callAccepted && <VideoElement playsInline muted ref={myVideo} autoPlay />}

                    {/* control buttons */}
                    <ControlButtons>
                        <ControlIconButton onClick={() => toggleMicrophone(selectedVideoChat._id)}>
                            {microphoneOn ? <Mic /> : <MicOff />}
                        </ControlIconButton>
                        <ControlIconButton onClick={() => toggleCamera(selectedVideoChat._id)}>
                            {cameraOn ? <Videocam /> : <VideocamOff />}
                        </ControlIconButton>
                        {callAccepted && !callEnded && <ControlEndCallIconButton onClick={handleEndCall}>
                            <CallEnd />
                        </ControlEndCallIconButton>}
                        {!callAccepted && <ControlCallIconButton onClick={handleCallUser}>
                            <Call />
                        </ControlCallIconButton>}
                        <ControlIconButton onClick={handleCameraMenuOpen}>
                            <FlipCameraAndroid />
                        </ControlIconButton>
                    </ControlButtons>

                    {/* user video player */}
                    {callAccepted && !callEnded && (
                        <VideoElement playsInline ref={userVideo} autoPlay />
                    )}
                </VideoPaper>}

            {/* camera devices menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCameraMenuClose}
            >
                {videoDevices.map((device) => (
                    <MenuItem
                        key={device.deviceId}
                        selected={device.deviceId === selectedDeviceId}
                        onClick={() => handleDeviceChange(device.deviceId)}
                    >
                        {device.label || `Camera ${device.deviceId}`}
                    </MenuItem>
                ))}
            </Menu>

            {/*  outgoing call modal */}
            <OutgoingCallModalWidget open={openOutgoingCallDialog} onClose={handleClose} callingTo={selectedVideoChat} />
        </VideoContainer>
    );
};

export default VideoPlayerWidget;
