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
                src="https://i.pinimg.com/originals/2b/fc/00/2bfc004f2f1a0d6214a64175362a73c5.jpg"
                alt="advertisement"
                style={{ borderRadius: "0.75rem", margin: "0.75rem 0" }}
            />
            <FlexBetween>
                <Typography color={main}>HEINZ</Typography>
                <Typography color={medium}>heinz.com</Typography>
            </FlexBetween>
            <Typography color={medium} m="0.25rem 0">Heinz tomato paste is a concentrated form of tomato puree, renowned for its rich flavor and versatility in cooking. </Typography>
        </WidgetWrapper>
    )
}

export default AdvertisementWidget