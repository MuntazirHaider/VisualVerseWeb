import * as yup from "yup";
import { useEffect, useState } from "react";
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
import UserChatWidget from "./UserChatWidget";
// icons
import {
    SearchRounded as SearchIcon,
    SaveAltOutlined,
    HighlightOffOutlined
} from '@mui/icons-material';
// states
import { useSelector, useDispatch } from "react-redux";
import { setChats, setSelectedChat } from "state";
// routes
import RestApiClient from "routes/RestApiClient";
import Apis from "routes/apis";
// utils
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { useSocket } from "context/SocketContext";

const AddGroupModalWidget = ({ onClose, open, group = {}, userId, chats }) => {

    const token = useSelector((state) => state.token);

    const [isLoading, setIsLoading] = useState(false);
    const [currSearchQuery, setCurrSearchQuery] = useState("");
    const [selectedChip, setSelectedChip] = useState(null);
    const [searchReults, setSearchReults] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedUser, setSelectedUser] = useState([]);

    const { socket } = useSocket()
    const { palette } = useTheme();
    const dispatch = useDispatch();
    const api = new RestApiClient(token);

    // variable
    const isUpdate = group?._id ? true : false;

    // colors
    const dialogBackground = palette.background.default;
    const backgroundAlt = palette.background.alt;
    const neutralLight = palette.neutral.light;
    const neutralMedium = palette.neutral.medium;
    const neutralMain = palette.neutral.main;
    const primaryMain = palette.primary.main;

    const AddGroupModalWidgetSchema = yup.object().shape({
        groupName: yup.string().required("Group name is required").min(1, 'Atleast 1 characters are required').max(20, 'Maximum 20 characters are allowed'),
        groupPicture: yup.string(),
    });

    const initialAddGroupModalValue = {
        groupName: group?.chatName || "",
        groupPicture: group?.groupPicture || "",
    }

    // to upload a profile image
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

    // search user which are in friend to add in group
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

    // to reset all states and close modal
    const handleClose = () => {
        setSelectedUser(group?.users?.filter((u) => u._id !== group?.groupAdmin?._id) || []);
        setSearchReults([]);
        onClose();
    }

    // to add user in a group
    const handleGroup = (userToAdd) => {
        const isPresent = selectedUser.find(user => user._id === userToAdd._id);
        if (isPresent) {
            return;
        } else {
            setSelectedUser([...selectedUser, userToAdd]);
        }
    }

    // to remove a user from a group
    const handleUnSelctUser = (userToRemove) => {
        setSelectedUser(selectedUser.filter((user) => user._id !== userToRemove._id));
    }

    const handleChipClick = (userId) => {
        setSelectedChip((prevSelectedUserId) => (prevSelectedUserId === userId ? null : userId));
    };

    const createMessage = async (message, chatId) => {
        if (socket) {
            try {
                const body = {
                    "content": message,
                    chatId,
                    "contentType": 'info',
                }
                const response = await api.post(Apis.messages.index, body);
                if (response.result) {
                    socket.emit("chats: new message send", response.data);
                }
            } catch (error) {
                console.error(error);
                toast.error("Unable to send message");
            }
        }
    }

    // to submit a modal
    const handleSubmit = async (values, onSubmitProps) => {
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

            // if it for update group
            if (isUpdate) {
                body.chatId = group._id;
                body.admin = selectedChip !== null ? selectedChip : userId;
                let adminName = `${group.groupAdmin.firstName} ${group.groupAdmin.middleName} ${group.groupAdmin.lastName}`;
                response = await api.put(Apis.group.update, body);
                if (response.result) {
                    const updateChats = chats.filter((chat) => chat._id !== response.data._id)
                    dispatch(setChats({ chats: [response.data, ...updateChats] }));
                    dispatch(setSelectedChat({ selectedChat: response.data }));
                    toast.success("Group updated successfully");
                    createMessage(`Group updated by ${adminName}`, response.data._id);
                    socket.emit("chats: group updated", response.data);
                    group = response.data;
                }
            }
            // if it for create group
            else {
                response = await api.post(Apis.group.index, body);
                if (response.result) {
                    dispatch(setChats({ chats: [response.data, ...chats] }));
                    dispatch(setSelectedChat({ selectedChat: response.data }));
                    toast.success("Group created successfully");
                    createMessage(`Group created by ${response.data.groupAdmin.firstName} ${response.data.groupAdmin.middleName} ${response.data.groupAdmin.lastName}`, response.data._id);
                    socket.emit("chats: group created");
                }
            }
            handleClose();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong, Please try again");
        }
    }

    useEffect(() => {
        setSelectedUser(group?.users?.filter((u) => u._id !== group?.groupAdmin?._id) || []);
        // eslint-disable-next-line
    }, [isUpdate]);

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
                }) => {
                    return (
                        <form onSubmit={handleSubmit}>
                            {/* heading */}
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

                                    {/* for profile image */}
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
                                                    border={`2px dashed ${primaryMain}`}
                                                    p="1rem"
                                                    sx={{ "&:hover": { cursor: "pointer", filter: values.picturePath && "brightness(0.5)" } }}

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
                                                                // minHeight: { xs: 233, md: 167 }

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
                                                            <Typography sx={{ color: neutralMain, }} variant="h4">Add Picture</Typography>
                                                            <SaveAltOutlined sx={{ fontSize: "1.5rem" }} />
                                                        </Box>
                                                    ) : (
                                                        // Display image preview
                                                        <Box sx={{ "&:hover": { filter: values.groupPicture && "brightness(0.5)" }, display: 'flex', justifyContent: 'space-between' }}>
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
                                                                sx={{
                                                                    color: 'inherit',
                                                                    fontSize: '1.5rem',
                                                                    cursor: 'pointer',
                                                                }}
                                                                onClick={() => setFieldValue('groupPicture', '')}
                                                            />
                                                        </Box>
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
                                    <>
                                        {isUpdate && <Box sx={{ mb: 2, mt: 3 }}>
                                            <Chip variant='filled' label={`${group?.groupAdmin?.firstName}${group?.groupAdmin?.middleName}${group?.groupAdmin?.lastName} (Admin)`} avatar={<Avatar src={group?.groupAdmin?.picturePath} />} sx={{ cursor: "pointer" }} />
                                        </Box>}
                                        {group?.groupAdmin?._id === userId ?
                                            <Box sx={{ mb: 1, mt: 1 }}>
                                                {selectedUser?.map((u) => {
                                                    return (<span key={u._id}>
                                                        <Chip variant={selectedChip === u._id ? 'filled' : 'outlined'}
                                                            onDelete={() => handleUnSelctUser(u)}
                                                            onClick={() => {
                                                                handleChipClick(u._id);
                                                            }}
                                                            label={`${u.firstName}${u.middleName}${u.lastName}`}
                                                            avatar={<Avatar src={u.picturePath} />}
                                                            sx={{ m: 0.5, cursor: "pointer" }} />
                                                    </span>)
                                                })}
                                            </Box>
                                            :
                                            <Box>
                                                {selectedUser?.map((u) => {
                                                    return (<span key={u._id}>
                                                        <Chip variant='outlined' label={`${u.firstName}${u.middleName}${u.lastName}`} avatar={<Avatar src={u.picturePath} />} sx={{ m: 0.5, cursor: "pointer" }} />
                                                    </span>)
                                                })}
                                            </Box>}
                                        <Typography variant="subtitle1" color={neutralMain} sx={{ mb: 2 }}>* Only admin can update the group</Typography>
                                    </>
                                }


                                {/* search result list */}
                                {(!isLoading && searchReults.length > 0 && currSearchQuery !== "") &&
                                    searchReults.slice(0, 5).map((user) => {
                                        return (<span key={user._id} >
                                            <UserChatWidget name={`${user.firstName}${user.middleName}${user.lastName}`} picturePath={user.picturePath} handleSelectUser={() => handleGroup(user)} />
                                            <br />
                                        </span>);
                                    })}

                                {/* skeltons when searching for user */}
                                {isLoading && <Box sx={{ my: 2 }}>
                                    <Skeleton variant="body1" sx={{ mb: 1 }} />
                                    <Skeleton variant="body1" sx={{ mb: 1 }} />
                                    <Skeleton variant="body1" sx={{ mb: 1 }} />
                                </Box>}
                            </DialogContent>

                            {/* buttons */}
                            <DialogActions sx={{ p: 3 }}>
                                {/* cancel button */}
                                <LoadingButton
                                    sx={{
                                        backgroundColor: '#ff3333',
                                        color: backgroundAlt,
                                        borderRadius: "3rem",
                                        "&:hover": { color: '#ff3333' },
                                        height: '10%'
                                    }}
                                    onClick={handleClose}>
                                    Cancel
                                </LoadingButton>
                                {/* add or update button */}
                                <LoadingButton
                                    sx={{
                                        backgroundColor: primaryMain,
                                        color: backgroundAlt,
                                        borderRadius: "3rem",
                                        "&:hover": { color: primaryMain },
                                        height: '10%'
                                    }}
                                    disabled={group?.groupAdmin?._id !== userId && isUpdate}
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