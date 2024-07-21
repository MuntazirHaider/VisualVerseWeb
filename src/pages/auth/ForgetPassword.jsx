import React, { useState, useEffect } from 'react'
// @mui
import {
    Box,
    Typography,
    useTheme,
    useMediaQuery,
    TextField
} from "@mui/material";
import { LoadingButton } from '@mui/lab';
// router
import { useNavigate } from 'react-router-dom';
import RestApiClient from 'routes/RestApiClient';
import Apis from 'routes/apis';
// utils
import OtpInput from 'react-otp-input';
import { toast } from 'react-toastify';
import { formatTime } from 'utils/DateUtils';


const ForgetPassword = ({ mode }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isNonMobScreens = useMediaQuery("(min-width: 1000px)");
    const api = new RestApiClient();

    // colors
    const alt = theme.palette.background.alt;
    const primaryMain = theme.palette.primary.main;
    const primaryLight = theme.palette.primary.light;

    // state for input fields
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmpassword, setConfirmPassword] = useState('');

    // states for conditional redering
    const [isOtpSectionOpen, setIsOtpSectionOpen] = useState(false);
    const [isChangePasswordSectionOpen, setIsChangePasswordSectionOpen] = useState(false);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [remainingTime, setRemainingTime] = useState(120);

    // states for errors
    const [emailError, setEmailError] = useState('');
    const [otpError, setOtpError] = useState('');
    const [passwordError, setPasswordError] = useState('')

    // validations functions
    const validateEmail = () => {
        if (!email) {
            setEmailError('Email is required');
            return false;
        } else {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isValid = regex.test(email);
            isValid ? setEmailError('') : setEmailError('Invalid email');
            return isValid;
        }
    };

    const validateOtp = () => {
        if (otp !== '') {
            setOtpError('')
            return true;
        } else {
            setOtpError('OTP is required');
            return false;
        }
    }

    const validatePassword = () => {
        if (password === '') {
            setPasswordError('Password is required');
            return false;
        } else if (password.length < 6) {
            setPasswordError('Atleast 6 characters are required');
            return false;
        } else if (password.length > 20) {
            setPasswordError('Maximum 20 characters are allowed');
            return false;
        } else if (password !== confirmpassword) {
            setPasswordError('Both password are not matched')
            return false;
        } else {
            setPasswordError('');
            return true;
        }
    }

    // functions for conditional rendering 
    const handleOpenOtpSection = () => {
        setIsOtpSectionOpen(true);
        setIsTimerActive(true);
        setRemainingTime(120);
    }

    const handleCloseOtpSection = () => {
        setIsOtpSectionOpen(false);
        setIsTimerActive(false);
        setOtp('');
        setOtpError('');
    }

    const handleOpenChangePasswordSection = () => {
        handleCloseOtpSection();
        setIsChangePasswordSectionOpen(true);
    }

    const handleCloseChangePasswordSection = () => {
        setIsChangePasswordSectionOpen(false);
    }

    // function to send otp on email
    const handleSendOtp = async () => {
        if (validateEmail()) {
            try {
                const response = await api.authPost(Apis.auth.forgetPassword, { email });
                if (response.result) {
                    localStorage.setItem('visual_email', email);
                    setEmail('');
                    setEmailError('')
                    handleOpenOtpSection();
                } else {
                    toast.error(response.message);
                }
            } catch (error) {
                console.error(error);
            }
        }
    }

    // function to verify otp
    const handleVerifyOtp = async () => {
        if (validateOtp()) {
            try {
                const response = await api.authPost(Apis.auth.verifyOtp, {
                    email: localStorage.getItem('visual_email'),
                    otp
                });
                if (response.result) {
                    handleOpenChangePasswordSection()
                } else {
                    toast.error(response.message);
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            toast.error('OTP is required');
        }
    }

    // function to again sending otp
    const handleResendOTP = async () => {
        try {
            const response = await api.authPost(Apis.auth.forgetPassword, {
                email: localStorage.getItem('visual_email')
            });
            if (response.result) {
                toast.info("Again OTP is send to your email");
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error(error);
        }
        // Reset remaining time to 2 minutes (120 seconds)
        setRemainingTime(120);
    };

    // function to change the password
    const handleChangePassword = async () => {
        if (validatePassword()) {
            try {
                const response = await api.authPut(Apis.auth.changePassword, {
                    email: localStorage.getItem('visual_email'),
                    password
                });

                if (response.result) {
                    toast.info("Password changed successfully");
                    setPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                    handleCloseChangePasswordSection();
                    navigate("/login")
                } else {
                    toast.error("Something went wrong, Please try again");
                }
            } catch (error) {
                console.error(error);
            }
        }
    }

    useEffect(() => {
        const timer = setInterval(() => {
            // Decrease remaining time by 1 second
            setRemainingTime((prevTime) => prevTime - 1);
        }, 1000); // Run every second

        // Clean up the timer when component unmounts
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (remainingTime === 0) {
            // Close OTP section and stop the timer when time is up
            handleCloseOtpSection();
            toast.error("OTP expired, Please try again")
        }
    }, [remainingTime]);

    return (
        <Box>
            {/* Header */}
            <Box
                width="100%"
                backgroundColor={alt}
                p="1rem 6%"
                textAlign="center"
            >
                <Typography fontWeight="bold" fontSize="2rem" color="primary">
                    VisualVerse
                </Typography>
            </Box>

            <Box
                width={isNonMobScreens ? "50%" : "93%"}
                p="2rem"
                m="2rem auto"
                borderRadius="1.5rem"
                backgroundColor={alt}
            >
                <Typography fontWeight="500" variant="h4" sx={{ mb: "1.5rem" }} textAlign="center">
                    Forget Password ?
                </Typography>

                {/* Registered email code */}
                {(!isOtpSectionOpen && !isChangePasswordSectionOpen) && <Box>
                    <Typography fontWeight="500" variant="h5" sx={{ mb: "1.5rem" }} textAlign="center">
                        Enter Your Registered Email
                    </Typography>

                    <TextField fullWidth label="Email" id="email" onChange={(e) => setEmail(e.target.value)} error={!!emailError} helperText={emailError} />
                    <LoadingButton
                        onClick={handleSendOtp}
                        fullWidth
                        sx={{
                            m: "2rem 0",
                            p: "1rem",
                            backgroundColor: primaryMain,
                            color: alt,
                            "&:hover": { color: primaryMain },
                        }}
                    >
                        Send OTP
                    </LoadingButton>
                </Box>}

                {/* Verify Otp code */}
                {isOtpSectionOpen && <Box>
                    <Typography fontWeight="500" variant="h5" sx={{ mb: "1.5rem" }} textAlign="center">
                        OTP Send To Your Registered Email
                    </Typography>
                    {isTimerActive &&
                        <Box sx={{ textAlign: 'center', mb: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Typography>OTP expires in:</Typography>
                            <Typography sx={{ color: 'red' }}>
                                {formatTime(remainingTime)}
                            </Typography>
                        </Box>}
                    <Box display="flex" justifyContent="center">
                        <OtpInput
                            value={otp}
                            onChange={setOtp}
                            numInputs={6}
                            containerStyle={{ justifyContent: 'space-between' }}
                            inputType='number'
                            inputStyle={{
                                width: '100%',
                                maxWidth: "70px",
                                minWidth: "25px",
                                height: '50px',
                                margin: '0 2%',
                                fontSize: '1.5rem',
                                borderRadius: '10%',
                                border: otpError !== '' ? '1px solid red' : (mode === 'dark' ? '1px solid grey' : '1px solid lightGrey'),
                                color: primaryMain,
                                backgroundColor: alt
                            }}
                            renderSeparator={<span>.</span>}
                            renderInput={(props) => <input {...props} />}
                        />
                    </Box>
                    <Box sx={{ m: "2rem 0", textAlign: 'center' }}>
                        <LoadingButton
                            onClick={handleVerifyOtp}
                            fullWidth
                            sx={{
                                m: "0.5rem 0",
                                p: "1rem",
                                backgroundColor: primaryMain,
                                color: alt,
                                "&:hover": { color: primaryMain },
                            }}
                        >
                            Verify OTP
                        </LoadingButton>
                        <Typography
                            onClick={handleResendOTP}
                            sx={{
                                textDecoration: "underline",
                                color: primaryMain,
                                "&: hover": {
                                    cursor: "pointer",
                                    color: primaryLight,
                                }
                            }}
                        >
                            Didn't receive? Resend
                        </Typography>
                    </Box>
                </Box>}

                {/* Change password code */}
                {isChangePasswordSectionOpen && <Box>
                    <Typography fontWeight="500" variant="h5" sx={{ mb: "1.5rem" }} textAlign="center">
                        Enter Your New Password
                    </Typography>

                    <TextField fullWidth label="Enter Password" id="password" sx={{ mb: 2 }} onChange={(e) => setPassword(e.target.value)} type='password' error={!!passwordError} helperText={passwordError} />
                    <TextField fullWidth label="Confirm Password" id="confirmPassword" sx={{ mb: 2 }} onChange={(e) => setConfirmPassword(e.target.value)} type='password' error={!!passwordError} helperText={passwordError} />
                    <LoadingButton
                        fullWidth
                        onClick={handleChangePassword}
                        sx={{
                            m: "0.5rem 0",
                            mb: '2rem',
                            p: "1rem",
                            backgroundColor: primaryMain,
                            color: alt,
                            "&:hover": { color: primaryMain },
                        }}
                    >
                        Change Password
                    </LoadingButton>
                </Box>}

                {/* Footer */}
                <Typography
                    onClick={() => navigate("/login")}
                    sx={{
                        textDecoration: "underline",
                        color: primaryMain,
                        "&: hover": {
                            cursor: "pointer",
                            color: primaryLight,
                        }
                    }}
                >
                    Back to login?
                </Typography>
            </Box>

        </Box >
    )
}

export default ForgetPassword