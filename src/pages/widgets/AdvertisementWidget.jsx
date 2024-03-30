// @mui
import { Typography, useTheme } from "@mui/material";
// components
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";

const AdvertisementWidget = () => {
    const { palette } = useTheme();
    const dark = palette.neutral.dark;
    const main = palette.neutral.main;
    const medium = palette.neutral.medium;

    return (
        <WidgetWrapper>
            <FlexBetween>
                <Typography color={dark} variant="h5" fontWeight="500">
                    Sponsored
                </Typography>
                <Typography color={medium}>Created Ad</Typography>
            </FlexBetween>
            <img
                width="100%"
                height="auto"
                src="http://localhost:3001/assets/post2.jpg"
                alt="advertisement"
                style={{ borderRadius: "0.75rem", margin: "0.75rem 0" }}
            />
            <FlexBetween>
                <Typography color={main}>TechTool</Typography>
                <Typography color={medium}>techtool.com</Typography>
            </FlexBetween>
            <Typography color={medium} m="0.25rem 0">We inspire from technology to inspire the technology.</Typography>
        </WidgetWrapper>
    )
}

export default AdvertisementWidget