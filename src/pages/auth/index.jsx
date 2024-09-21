import { useState } from "react";
// @mui
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery
} from "@mui/material";
// component
import LoginForm from './LoginForm'
import SignupForm from "./SignupForm";
// redux
import { useNavigate } from "react-router-dom";

const Auth = ({ mode }) => {

  const [pageType, setpageType] = useState("login");

  const isLogin = pageType === 'login';

  // toggle page type
  const togglePage = () => {
    setpageType(isLogin ? "register" : "login");
  };

  const { palette } = useTheme();
  const navigate = useNavigate();

  const isNonMobScreens = useMediaQuery("(min-width: 1000px)");

  // colors
  const alt = palette.background.alt;
  const primaryMain = palette.primary.main;
  const primaryLight = palette.primary.light;

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

      {/* Container for form */}
      <Box
        width={isNonMobScreens ? "50%" : "93%"}
        p="2rem"
        m="2rem auto"
        borderRadius="1.5rem"
        backgroundColor={alt}
      >
        {/* heading */}
        <Typography fontWeight="500" variant="h5" sx={{ mb: "1.5rem" }} textAlign="center">
          Visualize the universe with VisualVerse
        </Typography>

        {/* toggle between login form and signup form */}
        {isLogin ? <LoginForm /> : <SignupForm mode={mode} togglePage={togglePage} />}

        <Box sx={{ display: isNonMobScreens ? 'flex' : 'block', justifyContent: 'space-between' }}>
          {/*  text to toggle between page type */}
          <Typography onClick={() => {
            setpageType(isLogin ? "register" : "login");
          }}
            sx={{
              textDecoration: "underline",
              color: primaryMain,
              "&:hover": {
                cursor: "pointer",
                color: primaryLight,
              }
            }}
          >
            {isLogin ? "Don't have an account, Sign Up here." : "Already have an account, Login here."}
          </Typography>

          {/* forget password test */}
          {isLogin && <Typography
            onClick={() => navigate("/forget-password")}
            sx={{
              textDecoration: "underline",
              color: primaryMain,
              "&: hover": {
                cursor: "pointer",
                color: primaryLight,
              }
            }}
          >
            Forget Password?
          </Typography>}
        </Box>
      </Box>

    </Box>
  )
}

export default Auth;