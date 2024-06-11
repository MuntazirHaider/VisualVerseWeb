import * as yup from "yup";
import { Formik } from "formik";
import { useState } from "react";
import Dropzone from "react-dropzone";
// @mui
import {
    Box,
    TextField,
    useMediaQuery,
    Typography,
    useTheme
} from "@mui/material"
import LoadingButton from '@mui/lab/LoadingButton';
import SaveAltOutlinedIcon from '@mui/icons-material/SaveAltOutlined';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
// routes
import { useNavigate } from "react-router-dom";
import Apis from "routes/apis";
import RestApiClient from "routes/RestApiClient";
// component
import FlexBetween from "components/FlexBetween";
// states
import { useDispatch } from "react-redux";
import { setLogin } from "state";
// utils
import { toast } from "react-toastify";
import ClipLoader from "react-spinners/ClipLoader";

const api = new RestApiClient();

const registerSchema = yup.object().shape({
    firstName: yup.string().required("Required Field").min(2, 'Atleast 2 characters are required').max(20, 'Maximum 20 characters are allowed'),
    middleName: yup.string().max(15, 'Maximum 15 characters are allowed'),
    lastName: yup.string().required("Required Field").min(2, 'Atleast 2 characters are required').max(20, 'Maximum 20 characters are allowed'),
    email: yup.string().email("Invalid email").required("Required Field"),
    password: yup.string().required("Required Field").min(6, 'Atleast 6 characters are required').max(20, 'Maximum 20 characters are allowed'),
    location: yup.string().max(30, 'Maximum 30 characters are allowed'),
    occupation: yup.string().max(50, 'Maximum 50 characters are allowed'),
    picturePath: yup.string(),
});

const loginSchema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Required Field"),
    password: yup.string().required("Required Field"),
});

const initialValRegister = {
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    location: "",
    occupation: "",
    picturePath: "",
}

const initialValLogin = {
    email: "",
    password: "",
}

const Form = () => {
    const [pageType, setpageType] = useState("login");
    const [isUploading, setIsUploading] = useState(false);
    const { palette } = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isNonMobScreens = useMediaQuery("(min-width: 600px)");
    const isLogin = pageType === "login";

    const register = async (values, onSubmitProps) => {
        try {
            const response = await api.authPost(Apis.auth.register, values);
            onSubmitProps.resetForm();
            if (response.result) {
                setpageType("login");
                toast.success("New User Registered Successfully!");
            } else {
                toast.error("Something Went Wrong!");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const login = async (values, onSubmitProps) => {
        try {
            const response = await api.authPost(Apis.auth.login, values);
            onSubmitProps.resetForm();
            if (response.token) {
                toast.success("Login Successfully!");
                dispatch(
                    setLogin({
                        user: response.user,
                        token: response.token
                    })
                );
                navigate("/home");
            } else {
                toast.error("Invalid Credentials!");
            }
        } catch (error) {
            console.log(error.message);
        }
    }

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

    const handleFormSubmit = async (values, onSubmitProps) => {
        if (isLogin) await login(values, onSubmitProps);
        else await register(values, onSubmitProps);
    }

    return (
        <Formik
            onSubmit={handleFormSubmit}
            initialValues={isLogin ? initialValLogin : initialValRegister}
            validationSchema={isLogin ? loginSchema : registerSchema}
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
                    {/* INPUT FIELDS */}
                    <Box
                        display="grid"
                        gap="4%"
                        gridTemplateColumns="repeat(3, minmax(0, 1fr))"
                        sx={{ "& > div": { gridColumn: isNonMobScreens ? undefined : "span 3" }, mb: !isNonMobScreens ? "100px" : '0px' }}
                    >
                        {!isLogin && (
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
                                    border={`1px solid ${palette.neutral.medium}`}
                                    borderRadius="5px"
                                    p="1rem"
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
                                                border={`2px dashed ${palette.primary.main}`}
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
                                                        <Typography sx={{ color: palette.neutral.main, }} variant="h4">Add picture here </Typography>
                                                        <SaveAltOutlinedIcon sx={{ fontSize: "1.5rem" }} />
                                                    </Box>
                                                ) : (
                                                    // Display image preview
                                                    <FlexBetween>
                                                        <Box
                                                            component="img"
                                                            sx={{
                                                                height: 233,
                                                                width: "100%",
                                                                maxHeight: { xs: 233, md: 167 },
                                                                maxWidth: { xs: 350, md: 250 },
                                                            }}
                                                            alt="Uploaded"
                                                            src={values.picturePath}
                                                        />
                                                        <HighlightOffOutlinedIcon
                                                            sx={{ position: 'absolute', top: 3, right: 3, color: 'inherit', fontSize: "1.5rem" }}
                                                            onClick={() => setFieldValue('picturePath', '')}
                                                        />
                                                    </FlexBetween>
                                                )}
                                            </Box>
                                        )}
                                    </Dropzone>
                                </Box>
                            </>
                        )}
                        <TextField
                            label="Email *"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.email}
                            name="email"
                            error={Boolean(touched.email) && Boolean(errors.email)}
                            helperText={touched.email && errors.email}
                            sx={{ gridColumn: "span 3" }}
                        />
                        <TextField
                            label="Password *"
                            type="password"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.password}
                            name="password"
                            error={Boolean(touched.password) && Boolean(errors.password)}
                            helperText={touched.password && errors.password}
                            sx={{ gridColumn: "span 3" }}
                        />
                        <Typography sx={{ color: palette.neutral.mediumMain, mb: "14rem", width: "10rem" }}>* Fields are mandatory</Typography>
                    </Box>

                    {/* BUTTONS */}
                    <Box>
                        <LoadingButton
                            fullWidth
                            type="submit"
                            sx={{
                                m: "2rem 0",
                                p: "1rem",
                                backgroundColor: palette.primary.main,
                                color: palette.background.alt,
                                "&:hover": { color: palette.primary.main },
                            }}
                        >
                            {isLogin ? "LOGIN" : "REGISTER"}
                        </LoadingButton>
                        <Typography onClick={() => {
                            setpageType(isLogin ? "register" : "login")
                            resetForm();
                        }}
                            sx={{
                                textDecoration: "underline",
                                color: palette.primary.main,
                                "&: hover": {
                                    cursor: "pointer",
                                    color: palette.primary.light,
                                }
                            }}
                        >
                            {isLogin ? "Don't have an account, Sign Up here." : "Already have an account, Login here."}
                        </Typography>
                    </Box>
                </form>
            )}
        </Formik>
    )
}

export default Form;