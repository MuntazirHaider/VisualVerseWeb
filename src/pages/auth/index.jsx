// @mui
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
// component
import Form from './Form'

const LogIn = () => {

  const theme = useTheme();
  const isNonMobScreens = useMediaQuery("(min-width: 1000px)");
  const alt = theme.palette.background.alt;

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
        <Typography fontWeight="500" variant="h5" sx={{ mb: "1.5rem" }} textAlign="center">
          Visualize the universe with VisualVerse
        </Typography>
        <Form />
      </Box>

    </Box>
  )
}

export default LogIn;