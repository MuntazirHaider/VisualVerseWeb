import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import { playCallEnded } from 'utils/SoundUtils';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [stream, setStream] = useState();
    const [call, setCall] = useState({ isReceivedCall: false });
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [cameraOn, setCameraOn] = useState(true);
    const [microphoneOn, setMicrophoneOn] = useState(true);
    const [peer, setPeer] = useState(null);

    const myVideo = React.useRef();
    const userVideo = React.useRef();

    useEffect(() => {
        if (socket) {
            socket.on('video call: call ended', handleCallEnded);
            socket.on('video call: toggle camera', handleToggleCamera);
            socket.on('video call: toggle microphone', handleToggleMicrophone);
        }

        return () => {
            if (socket) {
                socket.off('video call: call ended', handleCallEnded);
                socket.off('video call: toggle camera', handleToggleCamera);
                socket.off('video call: toggle microphone', handleToggleMicrophone);
            }
        };
    }, [socket]);

    const setUserForVideoCall = () => {
        if (socket) {
            socket.emit('video call: set user');
        }
    }

    const handleCallEnded = () => {
        playCallEnded();
        window.location.reload();
    };

    const handleToggleCamera = (camera) => {
        if (userVideo.current?.srcObject) {
            userVideo.current.srcObject.getVideoTracks()[0].enabled = !camera;
        }
    };

    const handleToggleMicrophone = (microphone) => {
        if (userVideo.current?.srcObject) {
            userVideo.current.srcObject.getAudioTracks()[0].enabled = !microphone;
        }
    };

    const connectSocket = (token) => {
        if (!socket) {
            const socketInstance = io(process.env.REACT_APP_SERVER_ENDPOINT, {
                auth: { token }
            });
            socketInstance.on('connect', () => {
                setSocket(socketInstance);
            })
            socketInstance.on('connect', () => {
                setSocket(socketInstance);
            })
        }
    };

    const disconnectSocket = () => {
        if (socket) {
            socket.emit('user: disconnect');
            socket.disconnect();
            setSocket(null);
        }
    };

    const callUser = (userToCall, caller) => {
        const newPeer = new Peer({ initiator: true, trickle: false, stream });

        // Set up 'signal' event to send the initial offer
        newPeer.on('signal', (data) => {
            socket.emit('video call: call user', { userToCall, signalData: data, caller });
        });

        // Prepare to handle incoming stream once the call is accepted
        newPeer.on('stream', (currentStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }
        });

        // Listen for the 'call accepted' event and signal the received data
        socket.on('video call: call accepted', (signal) => {
            newPeer.signal(signal);
            setCallAccepted(true);
        });

        setPeer(newPeer);
    };


    const answerCall = () => {
        let newPeer;
        if (!stream) {
            const checkAndSetMyVideo = setInterval(() => {
                if (stream) {
                    clearInterval(checkAndSetMyVideo);
                }
            }, 1000);
        }

        newPeer = new Peer({ initiator: false, trickle: false, stream });

        newPeer.on('signal', (data) => {
            socket.emit('video call: answer call', { signal: data, to: call.caller._id });
        });

        const checkUserVideo = setInterval(() => {
            if (userVideo.current) {

                newPeer.on('stream', (currentStream) => {
                    userVideo.current.srcObject = currentStream;
                });
                newPeer.signal(call.signal);
                setPeer(newPeer);
                clearInterval(checkUserVideo);
            }
        }, 100);

        setCallAccepted(true);
    };

    const endCall = (id) => {
        setCallEnded(true);
        socket.emit("video call: end call", { to: id });
        window.location.reload();
    };

    const toggleCamera = (id) => {
        setCameraOn((prev) => !prev);
        if (stream) {
            stream.getVideoTracks()[0].enabled = !cameraOn;
            if (callAccepted && !callEnded) {
                socket.emit('video call: toggle camera', { camera: cameraOn, to: id });
            }
        }
    };

    const toggleMicrophone = (id) => {
        setMicrophoneOn((prev) => !prev);
        if (stream) {
            stream.getAudioTracks()[0].enabled = !microphoneOn;
            if (callAccepted && !callEnded) {
                socket.emit('video call: toggle microphone', { microphone: microphoneOn, to: id });
            }
        }
    };

    return (
        <SocketContext.Provider value={{ socket, connectSocket, disconnectSocket, call, setCall, callAccepted, setCallAccepted, myVideo, userVideo, stream, setStream, cameraOn, setCameraOn, microphoneOn, callEnded, setCallEnded, callUser, answerCall, endCall, toggleCamera, toggleMicrophone, setUserForVideoCall }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};
