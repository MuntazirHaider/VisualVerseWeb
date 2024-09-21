import * as yup from "yup";
import { Formik } from "formik";
import { useState } from "react";
// @mui
import {
    Box,
    TextField,
    useMediaQuery,
    Typography,
    useTheme,
    IconButton,
    InputAdornment
} from "@mui/material"
import { LoadingButton } from '@mui/lab';
// icons
import {
    Visibility,
    VisibilityOff
} from '@mui/icons-material';
// routes
import { useNavigate } from "react-router-dom";
import Apis from "routes/apis";
import RestApiClient from "routes/RestApiClient";
// states
import { useDispatch } from "react-redux";
import { setLogin } from "state";
import { useSocket } from "context/SocketContext";
// utils
import { toast } from "react-toastify";

const api = new RestApiClient();

const loginSchema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Required Field"),
    password: yup.string().required("Required Field"),
});

const initialValLogin = {
    email: "demo@123gmail.com",
    password: "demo@123",
}

const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);

    const { palette } = useTheme();
    const { connectSocket } = useSocket();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isNonMobScreens = useMediaQuery("(min-width: 600px)");

    // colors
    const alt = palette.background.alt;
    const primaryMain = palette.primary.main;
    const mediumMain = palette.neutral.mediumMain;

    //  To login a user
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
                connectSocket(response.token);
                navigate("/home");
            } else {
                toast.error("Invalid Credentials!");
            }
        } catch (error) {
            console.error(error.message);
        }
    }

    //  submit the form
    const handleFormSubmit = async (values, onSubmitProps) => {
        await login(values, onSubmitProps);
    }

    const handleClickShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <Formik
            key={'login'}
            onSubmit={handleFormSubmit}
            initialValues={initialValLogin}
            validationSchema={loginSchema}
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
                    {/* INPUT FIELDS */}
                    <Box
                        display="grid"
                        gap="4%"
                        gridTemplateColumns="repeat(3, minmax(0, 1fr))"
                        sx={{ "& > div": { gridColumn: isNonMobScreens ? undefined : "span 3" }, mb: isNonMobScreens ? "0px" : '100px' }}
                    >
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
                        <Typography sx={{ color: mediumMain, mb: "14rem", width: "10rem" }}>* Fields are mandatory</Typography>
                    </Box>

                    {/* BUTTON */}
                    <Box>
                        <LoadingButton
                            fullWidth
                            type="submit"
                            // loading
                            sx={{
                                m: "2rem 0",
                                p: "1rem",
                                backgroundColor: primaryMain,
                                color: alt,
                                "&:hover": { color: primaryMain },
                            }}
                        >
                            LOGIN
                        </LoadingButton>
                    </Box>
                </form>
            )}
        </Formik>
    )
}

export default LoginForm;