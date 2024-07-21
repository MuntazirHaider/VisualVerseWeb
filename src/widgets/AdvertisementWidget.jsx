// @mui
import {
    Typography,
    useTheme
} from "@mui/material";
// components
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";

const AdvertisementWidget = ({ advertisement }) => {

    const { palette } = useTheme();
    // colors
    const dark = palette.neutral.dark;
    const main = palette.neutral.main;
    const medium = palette.neutral.medium;

    return (
        <WidgetWrapper >
            {/* header */}
            <FlexBetween>
                <Typography color={dark} variant="h5" fontWeight="500">
                    Sponsored
                </Typography>
                <Typography color={medium}>Created Ad</Typography>
            </FlexBetween>
            {/* image */}
            <img
                width="100%"
                height="auto"
                src={advertisement.image}
                alt="advertisement"
                style={{ borderRadius: "0.75rem", margin: "0.75rem 0" }}
            />
            {/* sponser details */}
            <FlexBetween>
                <Typography color={main}>{advertisement.title}</Typography>
                <Typography color={medium}>{advertisement.website}</Typography>
            </FlexBetween>
            <Typography color={medium} m="0.25rem 0">{advertisement.description}</Typography>
        </WidgetWrapper>
    )
}

export default AdvertisementWidget