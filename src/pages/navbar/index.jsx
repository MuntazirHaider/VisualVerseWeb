import { useState } from 'react'
// mui
import {
  Box,
  IconButton,
  InputBase,
  Typography,
  Select,
  MenuItem,
  FormControl,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField,
  Button,
} from '@mui/material';
import {
  NotificationsNoneRounded as NotificationsNoneIcon,
  DarkModeRounded as DarkModeIcon,
  LightModeRounded as LightModeIcon,
  SearchRounded as SearchIcon,
  MessageRounded as MessageIcon,
  VideoCallRounded as VideoIcon,
  HelpRounded as HelpIcon,
  WidgetsRounded as WidgetsIcon,
  WindowRounded as WindowIcon,
  LogoutRounded as LogoutIcon,
  PersonOffRounded as DeleteAccountIcon
} from '@mui/icons-material';
// state
import { useDispatch, useSelector } from 'react-redux';
import { setMode, setLogout } from "state";
// route
import { useNavigate } from 'react-router-dom';
// component
import FlexBetween from 'components/FlexBetween';
// utils
import { toast } from "react-toastify";

const Navbar = ({ userId }) => {

  const { palette } = useTheme();
  const token = useSelector((state) => state.token);

  const [isMobMenuTuggled, setisMobMenuTuggled] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirmdeleteInput, setConfirmDeleteInput] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isNonMobScreens = useMediaQuery("(min-width: 1000px)");

  const theme = useTheme();
  const neutralLight = theme.palette.neutral.light;
  const dark = theme.palette.neutral.dark;
  const background = theme.palette.background.default;
  const primaryLight = theme.palette.primary.light;
  const alt = theme.palette.background.alt;


  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setConfirmDeleteInput('')
    setOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (confirmdeleteInput.trim() === 'delete') {
      await handledeleteAccount();
    } else {
      toast.error("Please type 'delete' to confirm account deletion.");
    }
    setConfirmDeleteInput('');
  };

  const handledeleteAccount = async () => {
    try {
      dispatch(setLogout());
      navigate("/");
      const response = await fetch(`http://localhost:3001/users/${userId}/delete`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const res = await response.json();
      if (res.result) {
        toast.success("Account Removed Successfully!");
      } else {
        toast.error("Unable To Remove Account");
      }
    } catch (error) {
      console.error('Error in deleting user:', error);
    }
  }

  return (
    <FlexBetween padding="1rem 6%" background={background}>
      <FlexBetween gap="1.75rem">
        <Typography
          fontWeight="bold"
          fontSize="1.5em"
          color="primary"
          onClick={() => navigate("/home")}
          sx={{
            "&:hover": {
              color: primaryLight,
              cursor: "pointer",
            },
          }}
        >
          VisualVerse
        </Typography>
        {isNonMobScreens && (
          <FlexBetween backgroundColor={neutralLight} borderRadius="9px" gap="3rem" padding="0.1rem 1.5rem">
            <InputBase placeholder='Search...' />
            <IconButton>
              <SearchIcon />
            </IconButton>
          </FlexBetween>
        )}
      </FlexBetween>

      {/* DESKTOP NAV */}
      {isNonMobScreens ? (
        <FlexBetween gap="2rem">
          <IconButton onClick={() => dispatch(setMode())}>
            {theme.palette.mode === "dark" ? (
              <LightModeIcon sx={{ fontSize: "25px" }} />
            ) : (
              <DarkModeIcon sx={{ color: dark, fontSize: "25px" }} />
            )}
          </IconButton>
          <MessageIcon sx={{ fontSize: "25px" }} />
          <VideoIcon sx={{ fontSize: "30px" }} />
          <NotificationsNoneIcon sx={{ fontSize: "25px" }} />
          <HelpIcon sx={{ fontSize: "25px" }} />
          <FormControl variant='standard' value={"Accounts Info"}>
            <Select
              value={"Accounts Info"}
              sx={{
                backgroundColor: neutralLight,
                width: "150px",
                borderRadius: "0.25rem",
                p: "0.25rem 0.75rem",
                "& .MuiSvgIcon-root": {
                  // pl: "0rem",
                  width: "3rem"
                },
                "& .MuiSelect-select:focus": {
                  backgroundColor: neutralLight
                },
              }}
              input={<InputBase />}
            >
              <MenuItem value={"Accounts Info"}>
                <Typography>{"Accounts Info"}</Typography>
              </MenuItem>
              <MenuItem onClick={() => { dispatch(setLogout()); navigate("/") }}><IconButton><LogoutIcon /></IconButton>Log Out</MenuItem>
              <MenuItem onClick={handleClickOpen}><IconButton><DeleteAccountIcon /></IconButton>Delete Account</MenuItem>
            </Select>
          </FormControl>
        </FlexBetween>
      ) : (
        <IconButton onClick={() => setisMobMenuTuggled(!isMobMenuTuggled)}>
          <WidgetsIcon />
        </IconButton >
      )}

      {/* MOBILE NAV */}
      {!isNonMobScreens && isMobMenuTuggled && (
        <Box
          position="fixed"
          right="0"
          top="0"
          height="70%"
          zIndex="10"
          maxWidth="500px"
          minWidth="300px"
          backgroundColor={alt}
        >
          {/* CLOSE ICON */}
          <Box display="flex" justifyContent="flex-end" p="1rem">
            <IconButton onClick={() => setisMobMenuTuggled(!isMobMenuTuggled)}>
              <WindowIcon />
            </IconButton>
          </Box>

          {/* MENU ITEMS */}
          <FlexBetween display="flex" flexDirection="column" justifyContent="center" alignItems="center" gap="2rem">
            <IconButton onClick={() => dispatch(setMode())} sx={{ fontSize: "25px" }}>
              {theme.palette.mode === "dark" ? (
                <LightModeIcon sx={{ color: dark, fontSize: "25px" }} />
              ) : (
                <DarkModeIcon sx={{ color: dark, fontSize: "25px" }} />
              )}
            </IconButton>
            <MessageIcon sx={{ fontSize: "25px" }} />
            <VideoIcon sx={{ fontSize: "25px" }} />
            <NotificationsNoneIcon sx={{ fontSize: "25px" }} />
            <HelpIcon sx={{ fontSize: "25px" }} />
            <FormControl variant='standard' value={"Accounts Info"}>
              <Select
                value={"Accounts Info"}
                sx={{
                  backgroundColor: neutralLight,
                  width: "150px",
                  borderRadius: "0.25rem",
                  p: "0.25rem 1rem",
                  "& .MuiSvgIcon-root": {
                    pr: "0.25rem",
                    width: "3rem"
                  },
                  "& .MuiSelect-select:focus": {
                    backgroundColor: neutralLight
                  }
                }}
                input={<InputBase />}
              >
                <MenuItem value={"Accounts Info"}>
                  <Typography>{"Accounts Info"}</Typography>
                </MenuItem>
                <MenuItem onClick={() => { dispatch(setLogout()); navigate("/") }}><IconButton><LogoutIcon /></IconButton>Log Out</MenuItem>
                <MenuItem onClick={handleClickOpen}><IconButton><DeleteAccountIcon /></IconButton>Delete Account</MenuItem>
              </Select>
            </FormControl>
          </FlexBetween>
        </Box>
      )}

      {/*  Confirmation Dialog */}
      <>
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth='sm'
          fullWidth
          PaperProps={{
            component: 'form',
            onSubmit: (event) => {
              event.preventDefault();
              handleDeleteConfirm();
            },
          }}
        >
          <DialogTitle>Confirm Your Action</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ display: 'flex' }}>
              Please type " delete " to confirm account deletion.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Type Delete"
              fullWidth
              onChange={(e) => setConfirmDeleteInput(e.target.value)}
              value={confirmdeleteInput}
              variant="standard"
            />
          </DialogContent>
          <DialogActions sx={{ pb: 2, pr: 2 }}>
            <Button
              sx={{
                backgroundColor: '#ff3333',
                color: palette.background.alt,
                borderRadius: "3rem",
                "&:hover": { color: '#ff3333' },
                width: '15%',
                height: '15%'
              }}
              onClick={handleClose}>
              Cancel
            </Button>
            <Button
              sx={{
                backgroundColor: palette.primary.main,
                color: palette.background.alt,
                borderRadius: "3rem",
                "&:hover": { color: palette.primary.main },
                width: '15%',
                height: '15%'
              }}
              type="submit"
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </>
    </FlexBetween>
  );
};

export default Navbar;