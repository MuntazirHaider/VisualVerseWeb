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
// icons
import PhoneDisabledIcon from '@mui/icons-material/PhoneDisabled';
// utils
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

const OutgoingCallModalWidget = ({ open, onClose, callingTo }) => {
    const { socket, callAccepted } = useSocket();
    const { palette } = useTheme();

    // colors
    const dialogBackground = palette.background.default;

    const handleCancelCall = () => {
        socket.emit('video call: cancel call', { to: callingTo._id });
        playCallEnded();
        onClose();
    };

    useEffect(() => {
        if (callAccepted) {
            onClose();
        }
    }, [callAccepted])

    return (
        <CustomDialog open={open} onClose={() => {}}
            PaperProps={{
                sx: {
                    backgroundColor: dialogBackground
                }
            }}>
            <CustomDialogTitle>Outgoing Video Call</CustomDialogTitle>
            <CustomDialogContent>
                <Avatar
                    src={callingTo?.picturePath}
                    alt={`${callingTo?.firstName} ${callingTo?.middleName} ${callingTo?.lastName}`}
                    sx={{ width: 80, height: 80 }}
                />
                <CustomDialogContentText>
                    Calling {`${callingTo?.firstName} ${callingTo?.middleName} ${callingTo?.lastName}`}...
                </CustomDialogContentText>
            </CustomDialogContent>
            <CustomDialogActions>
                <CallButton variant="contained" color="error" onClick={handleCancelCall}>
                    <PhoneDisabledIcon />
                </CallButton>
            </CustomDialogActions>
        </CustomDialog>
    );
};

export default OutgoingCallModalWidget;
