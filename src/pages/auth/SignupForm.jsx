import * as yup from "yup";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import OtpInput from 'react-otp-input';
import Dropzone from "react-dropzone";
// @mui
import {
    useMediaQuery,
    useTheme,
    Box,
    Step,
    StepButton,
    Stepper,
    TextField,
    InputAdornment,
    IconButton,
    Typography
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
// router
import Apis from "routes/apis";
import RestApiClient from 'routes/RestApiClient';
// icons
import {
    Visibility,
    VisibilityOff,
    SaveAltOutlined as SaveAltOutlinedIcon,
    HighlightOffOutlined as HighlightOffOutlinedIcon,
} from '@mui/icons-material';
// utils
import { toast } from "react-toastify";
import { formatTime } from "utils/DateUtils";
import { ClipLoader } from "react-spinners";

const api = new RestApiClient();
const steps = ['Email and Password', 'Verification', 'Personal Information'];

const registerSchema = [
    yup.object().shape({
        email: yup.string().email("Invalid email").required("Required Field"),
        password: yup.string().required("Required Field").min(6, 'Atleast 6 characters are required').max(20, 'Maximum 20 characters are allowed'),
    }),
    null
    ,
    yup.object().shape({
        firstName: yup.string().required("Required Field").min(2, 'Atleast 2 characters are required').max(20, 'Maximum 20 characters are allowed'),
        middleName: yup.string().max(15, 'Maximum 15 characters are allowed'),
        lastName: yup.string().required("Required Field").min(2, 'Atleast 2 characters are required').max(20, 'Maximum 20 characters are allowed'),
        location: yup.string().max(30, 'Maximum 30 characters are allowed'),
        occupation: yup.string().max(50, 'Maximum 50 characters are allowed'),
        picturePath: yup.string(),
    }),
];

const initialValRegister = {
    email: "",
    password: "",
    firstName: "",
    middleName: "",
    lastName: "",
    location: "",
    occupation: "",
    picturePath: "",
}

const SignupForm = ({ mode, togglePage }) => {
    const [showPassword, setShowPassword] = useState(false);       // toggle password visibility
    const [activeStep, setActiveStep] = useState(0);               // storing the current active step
    const [isTimerActive, setIsTimerActive] = useState(false);     // storing is otp expire timer active
    const [remainingTime, setRemainingTime] = useState(120);       // counting the remaining time of otp to be expired
    const [otp, setOtp] = useState('');                            // otp value
    const [otpError, setOtpError] = useState('');                  // otp error
    const [isUploading, setIsUploading] = useState(false);         // is image uploading for profile

    const theme = useTheme();
    const { palette } = theme;

    const isNonMobScreens = useMediaQuery("(min-width: 600px)");

    // colors
    const alt = palette.background.alt;
    const primaryMain = palette.primary.main;
    const primaryLight = palette.primary.light;
    const neutralMedium = palette.neutral.medium;
    const neutralMain = palette.neutral.main;

    // toggle password
    const handleClickShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    // validate otp 
    const validateOtp = () => {
        if (otp !== '') {
            setOtpError('')
            return true;
        } else {
            setOtpError('OTP is required');
            return false;
        }
    }

    // clean up and state management functions
    const handleOpenOtpVerificationStep = () => {
        setIsTimerActive(true);
        setRemainingTime(120);
    }

    const handleCloseOtpVerificationStep = () => {
        setIsTimerActive(false);
        setRemainingTime(120);
        setOtp('');
        setOtpError('');
    }

    // function to send otp on email
    const handleSendOtp = async (email) => {
        try {
            const response = await api.authPost(Apis.auth.register_newMail, { email });
            if (response.result) {
                toast.success("OTP sent successfully!");
                return true;
            } else {
                toast.error(response.message);
                return false;
            }
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // function to verify otp
    const handleVerifyOtp = async (email) => {
        if (validateOtp()) {
            try {
                const response = await api.authPost(Apis.auth.register_verifyOtp, {
                    email,
                    otp
                });
                if (response.result) {
                    toast.success('OTP is verified');
                    return true;
                } else {
                    toast.error(response.message);
                    return false;
                }
            } catch (error) {
                console.error(error);
                return false;
            }
        } else {
            toast.error('OTP is required');
            return false;
        }
    }

    // To upload a image
    const uploadFile = async (img) => {
        setIsUploading(true)
        const data = new FormData();
        data.append("file", img);
        data.append("upload_preset", 'Image_Preset');

        try {
            const response = await api.uploadMedia(Apis.upload.image, data);
            const { secure_url } = response;
            setIsUploading(false);
            return secure_url;
        } catch (error) {
            console.error(error);
        }
    }

    //  to register a new user
    const register = async (values, onSubmitProps) => {
        try {
            const response = await api.authPost(Apis.auth.register, values);
            onSubmitProps.resetForm();
            if (response.result) {
                toast.success("New User Registered Successfully!");
                togglePage();
            } else {
                toast.error("Something Went Wrong!");
            }
        } catch (error) {
            console.error(error);
        }
    }

    // to submit the current step
    const handleFormSubmit = async (values, onSubmitProps) => {
        if (activeStep === steps.length - 1) {
            await register(values, onSubmitProps);
        } else if (activeStep === 0) {
            const isOtpSend = await handleSendOtp(values.email);
            if (isOtpSend) {
                setActiveStep(1);
                handleOpenOtpVerificationStep();
            }
        } else {
            const verified = await handleVerifyOtp(values.email);
            if (verified) {
                setActiveStep(2);
                handleCloseOtpVerificationStep();
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
        if (remainingTime === 0 && isTimerActive) {
            // Close OTP section and stop the timer when time is up
            handleCloseOtpVerificationStep();
            setActiveStep(0);
            toast.error("OTP expired, Please try again")
        }
    }, [remainingTime]);

    return (
        <Formik
            key={'register'}
            onSubmit={(values, onSubmitProps) => {
                handleFormSubmit(values, onSubmitProps);
            }}
            initialValues={initialValRegister}
            validationSchema={registerSchema[activeStep]}
            validateOnChange={true}
            validateOnBlur={true}
            validateOnMount={true}
        >
            {({
                values,
                errors,
                touched,
                handleBlur,
                handleChange,
                handleSubmit,
                setFieldValue,
                resetForm,
            }) => (
                <form onSubmit={handleSubmit}>
                    {/* stepper */}
                    <Stepper activeStep={activeStep} sx={{ width: '100%', mb: '3rem' }}>
                        {steps.map((step, index) => (
                            <Step key={step} >
                                <StepButton onClick={() => setActiveStep(index)}>
                                    {isNonMobScreens ? step : null}
                                </StepButton>
                            </Step>
                        ))}
                    </Stepper>

                    {/* INPUT FIELDS */}
                    <Box
                        display="grid"
                        gap="4%"
                        gridTemplateColumns="repeat(3, minmax(0, 1fr))"
                        sx={{ "& > div": { gridColumn: isNonMobScreens ? undefined : "span 3" }, mb: isNonMobScreens ? "0px" : '100px' }}
                    >
                        {/* 1 step */}
                        {activeStep === 0 && (
                            <>
                                <TextField
                                    label="Email *"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.email}
                                    name="email"
                                    error={Boolean(touched.email) && Boolean(errors.email)}
                                    helperText={touched.email && errors.email}
                                    sx={{ gridColumn: "span 3", mb: 2 }}
                                />
                                <TextField
                                    label="Password *"
                                    type={showPassword ? "text" : "password"}
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.password}
                                    name="password"
                                    error={Boolean(touched.password) && Boolean(errors.password)}
                                    helperText={touched.password && errors.password}
                                    sx={{ gridColumn: "span 3" }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </>
                        )}

                        {/* 2 step */}
                        {activeStep === 1 && (
                            <>
                                {isTimerActive &&
                                    <Box sx={{ textAlign: 'center', mb: 1, display: 'flex', justifyContent: 'center', gap: 1, gridColumn: "span 3" }} >
                                        <Typography>OTP expires in:</Typography>
                                        <Typography sx={{ color: 'red' }}>
                                            {formatTime(remainingTime)}
                                        </Typography>
                                    </Box>}
                                <Box display="flex" justifyContent="center" sx={{ gridColumn: "span 3" }}>
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
                                {/* <Box sx={{ m: "2rem 0" }}> */}
                                <Typography
                                    onClick={() => handleSendOtp(values.email)}
                                    sx={{
                                        textDecoration: "underline",
                                        color: primaryMain,
                                        textAlign: 'end',
                                        "&: hover": {
                                            cursor: "pointer",
                                            color: primaryLight,
                                        },
                                        gridColumn: "span 3"
                                    }}
                                >
                                    Didn't receive? Resend
                                </Typography>
                                {/* </Box> */}
                            </>
                        )}

                        {/* 3 step */}
                        {activeStep === 2 && (
                            <>
                                <TextField
                                    label="First Name *"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.firstName}
                                    name="firstName"
                                    error={Boolean(touched.firstName) && Boolean(errors.firstName)}
                                    helperText={touched.firstName && errors.firstName}
                                    sx={{ gridColumn: "span 1" }}
                                />
                                <TextField
                                    label="Middle Name"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.middleName}
                                    name="middleName"
                                    error={Boolean(touched.middleName) && Boolean(errors.middleName)}
                                    helperText={touched.middleName && errors.middleName}
                                    sx={{ gridColumn: "span 1" }}
                                />
                                <TextField
                                    label="Last Name *"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.lastName}
                                    name="lastName"
                                    error={Boolean(touched.lastName) && Boolean(errors.lastName)}
                                    helperText={touched.lastName && errors.lastName}
                                    sx={{ gridColumn: "span 1" }}
                                />
                                <TextField
                                    label="Location"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.location}
                                    name="location"
                                    error={Boolean(touched.location) && Boolean(errors.location)}
                                    helperText={touched.location && errors.location}
                                    sx={{ gridColumn: "span 3" }}
                                />
                                <TextField
                                    label="Occupation"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.occupation}
                                    name="occupation"
                                    error={Boolean(touched.occupation) && Boolean(errors.occupation)}
                                    helperText={touched.occupation && errors.occupation}
                                    sx={{ gridColumn: "span 3" }}
                                />
                                <Box
                                    gridColumn="span 3"
                                    border={`1px solid ${neutralMedium}`}
                                    borderRadius="5px"
                                    p="1rem"
                                    mb='2rem'
                                >
                                    <Dropzone
                                        acceptedFiles=".jpeg,.jpg,.png"
                                        multiple={false}
                                        onDrop={(acceptedFiles) => {
                                            const img = acceptedFiles[0];
                                            uploadFile(img).then(url => {
                                                setFieldValue("picturePath", url);
                                            }).catch(error => {
                                                console.error("Failed to upload image:", error);
                                                toast.error("Failed to upload image");
                                            });
                                        }}
                                    >
                                        {({ getRootProps, getInputProps }) => (
                                            <Box
                                                {...getRootProps()}
                                                border={`2px dashed ${primaryMain}`}
                                                p="1rem"
                                                sx={{ "&:hover": { cursor: "pointer", filter: values.picturePath && "brightness(0.5)" } }}

                                            >
                                                <input {...getInputProps()} />
                                                {isUploading ? (
                                                    // Display spinner while uploading
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            height: 200,
                                                            maxHeight: { xs: 200, md: 167 }
                                                        }}
                                                    >
                                                        <ClipLoader
                                                            color="inherit"
                                                            loading={true}
                                                            size={50}
                                                            aria-label="Loading Spinner"
                                                            data-testid="loader"
                                                        />
                                                    </Box>

                                                ) : !values.picturePath ? (
                                                    // Display drop image text with icon
                                                    <Box sx={{ display: 'flex', gap: 2, height: 200, alignItems: 'center', justifyContent: 'center' }}>
                                                        <Typography sx={{ color: neutralMain, }} variant="h4">Add Picture</Typography>
                                                        <SaveAltOutlinedIcon sx={{ fontSize: "1.5rem" }} />
                                                    </Box>
                                                ) : (
                                                    // Display image preview
                                                    <Box
                                                        sx={{
                                                            position: 'relative',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'flex-start',
                                                        }}
                                                    >
                                                        <Box
                                                            component="img"
                                                            sx={{
                                                                height: '100%',
                                                                width: '100%',
                                                                maxHeight: { xs: 233, md: 167 },
                                                                maxWidth: { xs: 350, md: 250 },
                                                            }}
                                                            alt="Uploaded"
                                                            src={values.picturePath}
                                                        />
                                                        <HighlightOffOutlinedIcon
                                                            sx={{
                                                                color: 'inherit',
                                                                fontSize: '1.5rem',
                                                                cursor: 'pointer',
                                                            }}
                                                            onClick={() => setFieldValue('picturePath', '')}
                                                        />
                                                    </Box>
                                                )}
                                            </Box>
                                        )}
                                    </Dropzone>
                                </Box>
                            </>
                        )}
                    </Box>

                    {/* buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 2, mt: 8 }}>
                        <LoadingButton
                            fullWidth
                            sx={{
                                backgroundColor: '#ff3333',
                                color: alt,
                                "&:hover": { color: '#ff3333' },
                                height: '30%'
                            }}
                            onClick={() => {
                                resetForm();
                                setActiveStep(0);
                            }}
                        >
                            Cancel
                        </LoadingButton>
                        <LoadingButton
                            type="submit"
                            fullWidth
                            sx={{
                                backgroundColor: primaryMain,
                                color: alt,
                                "&:hover": { color: primaryMain },
                                height: '30%'
                            }}
                        >
                            {activeStep === steps.length - 1 ? 'Register' : 'Next'}
                        </LoadingButton>
                    </Box>
                </form>
            )}
        </Formik>
    )
}

export default SignupForm;
