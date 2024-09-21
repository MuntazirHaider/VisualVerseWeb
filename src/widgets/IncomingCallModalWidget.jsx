import React, { useEffect } from 'react';
// @mui
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Avatar,
  useTheme
} from '@mui/material';
import { styled } from '@mui/system';
// state
import { useSocket } from 'context/SocketContext.js';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSelectedVideoChat } from 'state';
// icons
import PhoneIcon from '@mui/icons-material/Phone';
import PhoneDisabledIcon from '@mui/icons-material/PhoneDisabled';
import { playCallEnded } from 'utils/SoundUtils';

// Custom styles
const CustomDialog = styled(Dialog)({
  '& .MuiPaper-root': {
    borderRadius: '16px',
    padding: '20px',
    maxWidth: '400px',
    textAlign: 'center'
  }
});

const CustomDialogTitle = styled(DialogTitle)({
  paddingBottom: '0'
});

const CustomDialogContent = styled(DialogContent)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingBottom: '0'
});

const CustomDialogContentText = styled(DialogContentText)({
  margin: '16px 0'
});

const CustomDialogActions = styled(DialogActions)({
  justifyContent: 'center',
  gap: '20px',
  paddingBottom: '16px'
});

const CallButton = styled(Button)({
  borderRadius: '50%',
  width: '56px',
  height: '56px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
});

const IncomingCallModalWidget = ({ open, onClose }) => {
  const { socket, call, setCall, answerCall, setCallAccepted } = useSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { palette } = useTheme();

  // colors
  const dialogBackground = palette.background.default;

  const handleAnswer = () => {
    setCallAccepted(true);
    dispatch(setSelectedVideoChat({ selectedVideoChat: call.caller }));
    navigate("/video-call");
    onClose();
    answerCall();
  };

  const handleDecline = () => {
    onClose();
    playCallEnded();
    socket.emit('video call: decline call', { to: call.caller._id });
    setCall({ isReceivedCall: false });
  }

  useEffect(() => {
    let timer;
    if (open) {
      timer = setTimeout(() => {
        handleDecline();
      }, 30000); 
    }
    return () => clearTimeout(timer);
  }, [open]);

  return (
    <CustomDialog open={open} onClose={() => { }}
      PaperProps={{
        sx: {
          backgroundColor: dialogBackground
        }
      }}>
      <CustomDialogTitle>Incoming Video Call</CustomDialogTitle>
      <CustomDialogContent>
        <Avatar
          src={call.caller?.picturePath}
          alt={`${call.caller?.firstName} ${call.caller?.lastName}`}
          sx={{ width: 80, height: 80 }}
        />
        <CustomDialogContentText>
          {`${call.caller?.firstName} ${call.caller?.middleName} ${call.caller?.lastName}`} is calling.
        </CustomDialogContentText>
      </CustomDialogContent>
      <CustomDialogActions>
        <CallButton variant="contained" color="success" onClick={handleAnswer}>
          <PhoneIcon />
        </CallButton>
        <CallButton variant="contained" color="error" onClick={handleDecline}>
          <PhoneDisabledIcon />
        </CallButton>
      </CustomDialogActions>
    </CustomDialog>
  );
};

export default IncomingCallModalWidget;
