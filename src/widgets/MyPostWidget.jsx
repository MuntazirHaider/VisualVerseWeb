// icons
import {
    // EditOutlined,
    // DeleteOutlined,
    HighlightOffOutlined,
    SaveAltOutlined,
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
    // IconButton,
    useMediaQuery,
    CardMedia
} from "@mui/material";
// components
import FlexBetween from "components/FlexBetween";
import UserImage from "components/UserImage";
import WidgetWrapper from "components/WidgetWrapper";
// react
import Dropzone from "react-dropzone";
import { useState } from "react";
// routes
import { useNavigate } from "react-router-dom";
import RestApiClient from "routes/RestApiClient";
import Apis from "routes/apis";
// state
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";
//  utils
import { toast } from "react-toastify";
import ClipLoader from "react-spinners/ClipLoader";

const MyPostWidget = ({ picturePath }) => {
    const dispatch = useDispatch();

    const [isMedia, setIsMedia] = useState(false);
    const [media, setMedia] = useState(null);
    const [mediaType, setMediaType] = useState('image')
    const [post, setpost] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const { _id } = useSelector((state) => state.user);
    const token = useSelector((state) => state.token);
    const api = new RestApiClient(token);

    const isNonMobScreens = useMediaQuery("(min-width: 450px)");

    const { palette } = useTheme();
    const navigate = useNavigate();
    const mediumMain = palette.neutral.mediumMain;
    const medium = palette.neutral.medium;
    const light = palette.neutral.light;

    const uploadMediaFile = async (file, type) => {
        setIsUploading(true)
        const data = new FormData();
        data.append("file", file);
        let url = '';
        if (type === 'image') {
            data.append("upload_preset", 'Image_Preset');
            url = Apis.upload.image;
        } else {
            data.append("upload_preset", 'Video_Preset');
            url = Apis.upload.video;
        }
        try {
            const response = await api.uploadMedia(url, data);
            const { secure_url } = response;
            setIsUploading(false);
            return secure_url;
        } catch (error) {
            console.error(error);
        }
    }

    // Post new post
    const handlePost = async () => {
        const body = {
            "userId": _id,
            "description": post,
            "mediaType": mediaType,
        };
        if (media) {
            body.picturePath = media;
        }

        const response = await api.post(Apis.post.index, body);

        if (response.result) {
            toast.success("New Post Posted!");
            dispatch(setPosts({ posts: response.posts }));
            setMedia(null);
            setIsMedia(false);
            setMediaType('image')
            setpost("");
        }
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
            {isMedia && (
                <Box
                    border={`1px solid ${medium}`}
                    borderRadius="5px"
                    mt="1rem"
                    p="1rem"
                >
                    <Dropzone
                        acceptedFiles=".jpeg,.jpg,.png"
                        multiple={false}
                        onDrop={(acceptedFiles) => {
                            const file = acceptedFiles[0];
                            const extension = file.name.split('.').pop().toLowerCase();

                            // Check if the uploaded file is an image based on file extension
                            if (['jpeg', 'jpg', 'png'].includes(extension)) {
                                uploadMediaFile(file, 'image').then(url => {
                                    setMediaType('image');
                                    setMedia(url);
                                }).catch(error => {
                                    console.error("Failed to upload image:", error);
                                    toast.error("Failed to upload Media");
                                });
                            }
                            // Check if the uploaded file is a video based on file extension
                            else if (['mp4', 'avi', 'mov', 'gif'].includes(extension)) {
                                uploadMediaFile(file, 'video').then(url => {
                                    setMediaType('video')
                                    setMedia(url);
                                }).catch(error => {
                                    console.error("Failed to upload video:", error);
                                    toast.error("Failed to upload Media");
                                });
                            }
                            // Unsupported file extension
                            else {
                                console.error("Unsupported file extension:", extension);
                                toast.error("Unsupported file extension");
                            }
                        }}
                    >
                        {({ getRootProps, getInputProps }) => (
                            <Box
                                {...getRootProps()}
                                border={`2px dashed ${palette.primary.main}`}
                                p="1rem"
                                sx={{ cursor: 'pointer' }}
                            >
                                <input {...getInputProps()} />
                                {isUploading ? (
                                    // Display spinner while uploading
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            minHeight: { xs: 233, md: 167 }
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

                                ) : !media ? (
                                    // Display drop image text with icon
                                    <Box sx={{ display: 'flex', gap: 2, minHeight: { xs: 233, md: 167 }, alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography sx={{ color: palette.neutral.main, }} variant="h4">Add picture here </Typography>
                                        <SaveAltOutlined sx={{ fontSize: "1.5rem" }} />
                                    </Box>
                                ) : (
                                    // Display image preview
                                    <FlexBetween sx={{ "&:hover": { filter: media && "brightness(0.5)" } }}>
                                        {mediaType === 'image' ?
                                            <Box
                                                component="img"
                                                sx={{
                                                    width: "100%",
                                                    height: "auto",
                                                    maxHeight: { xs: 233, md: 167 },
                                                    maxWidth: { xs: 350, md: 250 },
                                                }}
                                                alt="Uploaded"
                                                src={media}
                                            />
                                            :
                                            <CardMedia
                                                component="video"
                                                controls
                                                src={media}
                                                title="Uploaded"
                                                sx={{
                                                    width: "100%",
                                                    height: "auto",
                                                    maxHeight: { xs: 233, md: 167 },
                                                    maxWidth: { xs: 350, md: 250 },
                                                }}
                                            />}
                                        <HighlightOffOutlined
                                            sx={{
                                                color: 'inherit',
                                                fontSize: '1.5rem',
                                                position: 'absolute',
                                                top: 2,
                                                right: 2,
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => setMedia('')}
                                        />
                                    </FlexBetween>
                                )}
                            </Box>
                        )}
                    </Dropzone>
                </Box>
            )}

            <Divider sx={{ margin: "1.25rem 0" }} />

            <FlexBetween>
                <FlexBetween gap="0.25rem" onClick={() => setIsMedia(!isMedia)} sx={{cursor: "pointer"}}>
                    <ImageOutlined sx={{ color: mediumMain }} />
                    <Typography color={mediumMain} sx={{ "&:hover": { color: medium } }}>
                        Media
                    </Typography>
                </FlexBetween>

                {isNonMobScreens &&
                    <>
                        <FlexBetween gap="0.25rem" onClick={() => navigate('/chats')} sx={{cursor: "pointer"}}>
                            <MessageIcon sx={{ color: mediumMain }} />
                            <Typography color={mediumMain}>Chats</Typography>
                        </FlexBetween>
                        <FlexBetween gap="0.25rem" sx={{cursor: "pointer"}}>
                            <VideoIcon sx={{ color: mediumMain }} fontSize="medium" />
                            <Typography color={mediumMain}>Video Call</Typography>
                        </FlexBetween>
                    </>
                }

                <Button
                    disabled={!post && !media}
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