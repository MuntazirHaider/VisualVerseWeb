import { Box } from "@mui/material";

const UserImage = ({ image, size = "60px" }) => {
    return (
        <Box
            component="img"
            width={size}
            height={size}
            sx={{ borderRadius: '50%', objectFit: "cover" }}
            alt="Not Found"
            src={image}
        />
    );
};

export default UserImage;