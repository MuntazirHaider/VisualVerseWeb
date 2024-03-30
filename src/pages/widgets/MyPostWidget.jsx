// icons
import {
    EditOutlined,
    DeleteOutlined,
    ImageOutlined,
    MessageRounded as MessageIcon,
    VideoCallRounded as VideoIcon,
} from "@mui/icons-material";
// @mui
import {
    Box,
    Divider,
    Typography,
    InputBase,
    useTheme,
    Button,
    IconButton,
    useMediaQuery
} from "@mui/material";
// components
import FlexBetween from "components/FlexBetween";
import UserImage from "components/UserImage";
import WidgetWrapper from "components/WidgetWrapper";
// react
import Dropzone from "react-dropzone";
import { useState } from "react";
// state
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";
//
import { toast } from "react-toastify";

const MyPostWidget = ({ picturePath }) => {
    const dispatch = useDispatch();

    const [isImage, setIsImage] = useState(false);
    const [image, setImage] = useState(null);
    const [post, setpost] = useState("");

    const { _id } = useSelector((state) => state.user);
    const token = useSelector((state) => state.token);

    const isNonMobScreens = useMediaQuery("(min-width: 450px)");

    const { palette } = useTheme();
    const mediumMain = palette.neutral.mediumMain;
    const medium = palette.neutral.medium;
    const light = palette.neutral.light;

    // Post new post
    const handlePost = async () => {
        const body = {
            "userId": _id,
            "description": post
        };
        if (image) {
            body.picturePath = image.name;
        }

        console.log("BODY DATA", body);

        const response = await fetch(`http://localhost:3001/posts`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body), // Convert body to JSON string
        });

        const data = await response.json();
        toast.success("New Post Posted!");
        dispatch(setPosts({ posts: data.posts }));
        setImage(null);
        setIsImage(false);
        setpost(""); // corrected setpost to setPost
    };


    return (
        <WidgetWrapper mb='2rem'>
            <FlexBetween gap="1.5rem">
                <UserImage image={picturePath} />
                <InputBase
                    placeholder="What's on your mind..."
                    onChange={(e) => setpost(e.target.value)}
                    value={post}
                    sx={{
                        width: "100%",
                        backgroundColor: light,
                        borderRadius: "2rem",
                        padding: "1rem 2rem"
                    }}
                />
            </FlexBetween>
            {isImage && (
                <Box
                    border={`1px solid ${medium}`}
                    borderRadius="5px"
                    mt="1rem"
                    p="1rem"
                >
                    <Dropzone
                        acceptedFiles=".jpeg,.jpg,.png"
                        multiple={false}
                        onDrop={(acceptedFiles) => setImage(acceptedFiles[0])}
                    >
                        {({ getRootProps, getInputProps }) => (
                            <FlexBetween>
                                <Box
                                    {...getRootProps()}
                                    border={`2px dashed ${palette.primary.main}`}
                                    p="1rem"
                                    width="100%"
                                    sx={{ "&:hover": { cursor: "pointer" } }}
                                >
                                    <input {...getInputProps()} />
                                    {!image ? (
                                        <Typography sx={{ color: palette.neutral.main }}>Add Image here *</Typography>
                                    ) : (
                                        <FlexBetween>
                                            <Typography>{image.name}</Typography>
                                            <EditOutlined />
                                        </FlexBetween>
                                    )}
                                </Box>
                                {image && (
                                    <IconButton
                                        onClick={() => setImage(null)}
                                        sx={{ width: "15%" }}
                                    >
                                        <DeleteOutlined />
                                    </IconButton>
                                )}
                            </FlexBetween>
                        )}
                    </Dropzone>
                </Box>
            )}

            <Divider sx={{ margin: "1.25rem 0" }} />

            <FlexBetween>
                <FlexBetween gap="0.25rem" onClick={() => setIsImage(!isImage)}>
                    <ImageOutlined sx={{ color: mediumMain }} />
                    <Typography color={mediumMain} sx={{ "&:hover": { cursor: "pointer", color: medium } }}>
                        Image
                    </Typography>
                </FlexBetween>

                {isNonMobScreens &&
                    <>
                        <FlexBetween gap="0.25rem">
                            <MessageIcon sx={{ color: mediumMain }} />
                            <Typography color={mediumMain}>Chats</Typography>
                        </FlexBetween>
                        <FlexBetween gap="0.25rem">
                            <VideoIcon sx={{ color: mediumMain }} fontSize="medium"/>
                            <Typography color={mediumMain}>Video Call</Typography>
                        </FlexBetween>
                    </>
                }

                <Button
                    disabled={!post && !image}
                    onClick={handlePost}
                    sx={{
                        backgroundColor: palette.primary.main,
                        color: palette.background.alt,
                        borderRadius: "3rem",
                        "&:hover": { color: palette.primary.main }
                    }}
                >
                    POST
                </Button>
            </FlexBetween>
        </WidgetWrapper>
    )
}

export default MyPostWidget;