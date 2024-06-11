import * as yup from "yup";
import { useState } from "react";
import { Formik } from "formik";
import Dropzone from "react-dropzone";
// @mui
import {
    Box,
    TextField,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    InputBase,
    Skeleton,
    Chip,
    Avatar,
    Typography
} from "@mui/material"
import { LoadingButton } from "@mui/lab";
// component
import FlexBetween from "components/FlexBetween";
// pages
import UserChatWidget from "./UserChatWidget";
// icons
import {
    SearchRounded as SearchIcon,
    SaveAltOutlined,
    HighlightOffOutlined
} from '@mui/icons-material';
// redux
import { useSelector, useDispatch } from "react-redux";
// states
import { setChats, setSelectedChat } from "state";
// routes
import RestApiClient from "routes/RestApiClient";
import Apis from "routes/apis";
// utils
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

const AddGroupModalWidget = (props) => {
    const { onClose, open, group = {}, userId } = props;

    const { palette } = useTheme();
    const dispatch = useDispatch();

    const token = useSelector((state) => state.token);
    const chats = useSelector((state) => state.chats);
    const api = new RestApiClient(token);

    const [isLoading, setIsLoading] = useState(false);
    const [currSearchQuery, setCurrSearchQuery] = useState("");
    const [searchReults, setSearchReults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(group?.users?.filter((u) => u._id !== userId) || []);
    const [isUploading, setIsUploading] = useState(false);
    const isUpdate = group?._id ? true : false;

    const dialogBackground = palette.background.default;
    const neutralLight = palette.neutral.light;
    const neutralMedium = palette.neutral.medium

    const AddGroupModalWidgetSchema = yup.object().shape({
        groupName: yup.string().required("Group name is required").min(1, 'Atleast 1 characters are required').max(20, 'Maximum 20 characters are allowed'),
        groupPicture: yup.string(),
    });

    const initialAddGroupModalValue = {
        groupName: group?.chatName || "",
        groupPicture: group?.groupPicture || "",
    }

    const uploadFile = async (img) => {
        setIsUploading(true)
        const data = new FormData();
        data.append("file", img);
        data.append("upload_preset", 'Image_Preset');

        try {
            const response = await api.uploadMedia(Apis.upload.image, data);
            const { secure_url } = response;
            setIsUploading(false);
            return secure_url;
        } catch (error) {
            console.error(error);
        }
    }

    const handleSearch = async (query) => {
        setIsLoading(true);
        setCurrSearchQuery(query);
        try {
            const response = await api.get(`${Apis.chats.search}?search=${query}`)
            if (response.result) {
                setTimeout(() => {
                    setIsLoading(false);
                }, 1000);
                setSearchReults(response.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong, Please try again");
        }
    }

    const handleClose = () => {
        setSelectedUser([]);
        setSearchReults([]);
        onClose();
    }

    const handleGroup = (userToAdd) => {
        const isPresent = selectedUser.find(user => user._id === userToAdd._id);
        if (isPresent) {
            return;
        } else {
            setSelectedUser([...selectedUser, userToAdd]);
        }
    }

    const handleUnSelctUser = (userToRemove) => {
        setSelectedUser(selectedUser.filter((user) => user._id !== userToRemove._id));
    }

    const handleSubmit = async (values, onSubmitProps) => {
        console.log("VALUES", values);
        console.log("SELECTED USERS", selectedUser);

        if (selectedUser.length < 1) {
            toast.error("At least 1 user must be selected");
            return;
        }

        try {
            const body = {
                name: values.groupName,
                groupPicture: values.groupPicture,
                users: JSON.stringify(selectedUser.map(user => user._id))
            }
            let response;

            if (isUpdate) {
                body.chatId = group._id;
                response = await api.put(Apis.group.update, body);
                if (response.result) {
                    const updateChats = chats.filter((chat) => chat._id !== response.data._id)
                    dispatch(setChats({ chats: [response.data, ...updateChats] }));
                    dispatch(setSelectedChat({ selectedChat: response.data }));
                    toast.success("Group updated successfully");
                }
            } else {
                response = await api.post(Apis.group.index, body);
                if (response.result) {
                    dispatch(setChats({ chats: [response.data, ...chats] }));
                    dispatch(setSelectedChat({ selectedChat: response.data }));
                    toast.success("Group created successfully");
                }
            }
            handleClose();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong, Please try again");
        }
    }



    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth='sm'
            PaperProps={{
                sx: {
                    backgroundColor: dialogBackground,
                    borderRadius: 3,
                },
            }}
        >
            <Formik
                onSubmit={handleSubmit}
                initialValues={initialAddGroupModalValue}
                validationSchema={AddGroupModalWidgetSchema}
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
                }) => {
                    return (
                        <form onSubmit={handleSubmit}>
                            <DialogTitle fontFamily={"sans-serif"}>{isUpdate ? "Update Group" : "Create Group"}</DialogTitle>
                            <DialogContent>
                                {/* INPUT FIELD */}
                                <Box
                                    display="grid"
                                    gap="4%"
                                >
                                    <TextField
                                        label="Group Name"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        value={values.groupName}
                                        name="groupName"
                                        error={Boolean(touched.groupName) && Boolean(errors.groupName)}
                                        helperText={touched.groupName && errors.groupName}
                                        sx={{ my: 1 }} />

                                    <Box
                                        border={`1px solid ${neutralMedium}`}
                                        borderRadius="5px"
                                        p="1rem"
                                    >
                                        <Dropzone
                                            acceptedFiles=".jpeg,.jpg,.png"
                                            multiple={false}
                                            onDrop={(acceptedFiles) => {
                                                const img = acceptedFiles[0];
                                                uploadFile(img).then(url => {
                                                    setFieldValue("groupPicture", url);
                                                }).catch(error => {
                                                    console.error("Failed to upload image:", error);
                                                    toast.error("Failed to upload image");
                                                });
                                            }}
                                        >
                                            {({ getRootProps, getInputProps }) => (
                                                <Box
                                                    {...getRootProps()}
                                                    border={`2px dashed ${palette.primary.main}`}
                                                    p="1rem"
                                                    sx={{ "&:hover": { cursor: "pointer", filter: values.groupPicture && "brightness(0.5)" } }}

                                                >
                                                    <input {...getInputProps()} />
                                                    {isUploading ? (
                                                        // Display spinner while uploading
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                height: 200,
                                                                maxHeight: { xs: 200, md: 167 }
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

                                                    ) : !values.groupPicture ? (
                                                        // Display drop image text with icon
                                                        <Box sx={{ display: 'flex', gap: 2, height: 200, alignItems: 'center', justifyContent: 'center' }}>
                                                            <Typography sx={{ color: palette.neutral.main, }} variant="h4">Add picture here </Typography>
                                                            <SaveAltOutlined sx={{ fontSize: "1.5rem" }} />
                                                        </Box>
                                                    ) : (
                                                        // Display image preview
                                                        <FlexBetween>
                                                            <Box
                                                                component="img"
                                                                sx={{
                                                                    height: 233,
                                                                    width: "100%",
                                                                    maxHeight: { xs: 233, md: 167 },
                                                                    maxWidth: { xs: 350, md: 250 },
                                                                }}
                                                                alt="Uploaded"
                                                                src={values.groupPicture}
                                                            />
                                                            <HighlightOffOutlined
                                                                sx={{ position: 'absolute', top: 3, right: 3, color: 'inherit', fontSize: "1.5rem" }}
                                                                onClick={() => setFieldValue('groupPicture', '')}
                                                            />
                                                        </FlexBetween>
                                                    )}
                                                </Box>
                                            )}
                                        </Dropzone>
                                    </Box>
                                    {/* Search Bar */}
                                    <FlexBetween backgroundColor={neutralLight} borderRadius="9px" padding="0.1rem 0.5rem" mb="1rem">
                                        <SearchIcon sx={{ mr: 1 }} />
                                        <InputBase placeholder='Search' sx={{ width: 1, height: '40px' }} onChange={(e) => handleSearch(e.target.value)} />
                                    </FlexBetween>
                                </Box>
                                {/* show selected user in chip */}
                                {selectedUser &&
                                    <Box sx={{ mb: 2, mt: 3 }}>
                                        {selectedUser?.map((u) => {
                                            return <>
                                                <Chip variant="outlined" onDelete={() => handleUnSelctUser(u)} label={`${u.firstName}${u.middleName}${u.lastName}`} avatar={<Avatar src={u.picturePath} />} key={u._id} sx={{ m: 0.5, cursor: "pointer" }} />
                                            </>
                                        })}
                                    </Box>}
                                {/* search result list */}
                                {(!isLoading && searchReults.length > 0 && currSearchQuery !== "") &&
                                    searchReults.slice(0, 5).map((user) => {
                                        return (<>
                                            <UserChatWidget name={`${user.firstName}${user.middleName}${user.lastName}`} picturePath={user.picturePath} handleSelectUser={() => handleGroup(user)} key={user._id} />
                                            <br />
                                        </>);
                                    })}
                                {/* skelton */}
                                {isLoading && <Box sx={{ my: 2 }}>
                                    <Skeleton variant="body1" sx={{ mb: 1 }} />
                                    <Skeleton variant="body1" sx={{ mb: 1 }} />
                                    <Skeleton variant="body1" sx={{ mb: 1 }} />
                                </Box>}
                            </DialogContent>
                            <DialogActions sx={{ p: 3 }}>
                                <LoadingButton
                                    sx={{
                                        backgroundColor: '#ff3333',
                                        color: palette.background.alt,
                                        borderRadius: "3rem",
                                        "&:hover": { color: '#ff3333' },
                                        height: '10%'
                                    }}
                                    onClick={handleClose}>
                                    Cancel
                                </LoadingButton>
                                <LoadingButton
                                    sx={{
                                        backgroundColor: palette.primary.main,
                                        color: palette.background.alt,
                                        borderRadius: "3rem",
                                        "&:hover": { color: palette.primary.main },
                                        height: '10%'
                                    }}
                                    type="submit"
                                >
                                    {isUpdate ? "Update Group" : "Create Group"}
                                </LoadingButton>
                            </DialogActions>
                        </form>
                    );
                }}
            </Formik>
        </Dialog>
    )
}

export default AddGroupModalWidget;