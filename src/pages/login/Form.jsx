import * as yup from "yup";
import { Formik } from "formik";
import { useState } from "react";
import Dropzone from "react-dropzone";
// @mui
import {
    Box,
    Button,
    TextField,
    useMediaQuery,
    Typography,
    useTheme
} from "@mui/material"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
// routes
import { useNavigate } from "react-router-dom";
// component
import FlexBetween from "components/FlexBetween";
// states
import { useDispatch } from "react-redux";
import { setLogin } from "state";
// utils
import { toast } from "react-toastify";



const registerSchema = yup.object().shape({
    firstName: yup.string().required("Required Field").min(2, 'Atleast 2 characters are required').max(20, 'Maximum 20 characters are allowed'),
    middleName: yup.string().max(15, 'Maximum 15 characters are allowed'),
    lastName: yup.string().required("Required Field").min(2, 'Atleast 2 characters are required').max(20, 'Maximum 20 characters are allowed'),
    email: yup.string().email("Invalid email").required("Required Field"),
    password: yup.string().required("Required Field").min(6, 'Atleast 6 characters are required').max(20, 'Maximum 20 characters are allowed'),
    location: yup.string().max(30, 'Maximum 30 characters are allowed'),
    occupation: yup.string().max(50, 'Maximum 50 characters are allowed'),
    picture: yup.string(),
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
    picture: "",
}

const initialValLogin = {
    email: "",
    password: "",
}

const Form = () => {
    const [pageType, setpageType] = useState("login");
    const { palette } = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isNonMobScreens = useMediaQuery("(min-width: 600px)");
    const isLogin = pageType === "login";

    const register = async (values, onSubmitProps) => {
        try {
            const formData = new FormData(); // allow to send the form info with image
        for (const value in values) {
            formData.append(value, values[value])
        }
        formData.append("picturePath", values.picture.name)
        const savedUserResponse = await fetch(
            "http://localhost:3001/auth/register",
            {
                method: "POST",
                body: formData,
            }
        );
        const savedUser = await savedUserResponse.json();
        onSubmitProps.resetForm();
        if (savedUser) {
            setpageType("login");
            toast.success("New User Registered Successfully!");
        }else{
            toast.error("Something Went Wrong!");
        }
        } catch (error) {
            console.log(error);
        }
    }

    const login = async (values, onSubmitProps) => {
        try {
            const loggedInResponse = await fetch(
                "http://localhost:3001/auth/login",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(values),
                }
            );
            const loggedIn = await loggedInResponse.json();
            onSubmitProps.resetForm();
            if (loggedIn.token) {
                toast.success("Login Successfully!");
                dispatch(
                    setLogin({
                        user: loggedIn.user,
                        token: loggedIn.token
                    })
                );
                navigate("/home");
            }else{
                toast.error("Invalid Credentials!");
            }
        } catch (error) {
            console.log(error.message);
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
                        gap="6%"
                        gridTemplateColumns="repeat(3, minmax(0, 1fr))"
                        sx={{ "& > div": { gridColumn: isNonMobScreens ? undefined : "span 3" },  mb: !isNonMobScreens ? "100px" : '0px' }}
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
                                        onDrop={(acceptedFiles) =>
                                            setFieldValue("picture", acceptedFiles[0])
                                        }
                                    >
                                        {({ getRootProps, getInputProps }) => (
                                            <Box
                                                {...getRootProps()}
                                                border={`2px dashed ${palette.primary.main}`}
                                                p="1rem"
                                                sx={{ "&:hover": { cursor: "pointer" } }}
                                            >
                                                <input {...getInputProps()} />
                                                {!values.picture ? (
                                                    <Typography sx={{ color: palette.neutral.main }}>Add picture here</Typography>
                                                ) : (
                                                    <FlexBetween>
                                                        <Typography>{values.picture.name}</Typography>
                                                        <EditOutlinedIcon />
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
                        <Typography sx={{ color: palette.neutral.mediumMain, mb: "14rem", width: "10rem"}}>* Fields are mandatory</Typography>
                    </Box>

                    {/* BUTTONS */}
                    <Box>
                        <Button
                            fullWidth
                            type="submit"
                            sx={{
                                m: "2rem 0",
                                p: "1rem",
                                backgroundColor: palette.primary.main,
                                color: palette.background.alt,
                                "&:hover": { color: palette.primary.main }
                            }}
                        >
                            {isLogin ? "LOGIN" : "REGISTER"}
                        </Button>
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