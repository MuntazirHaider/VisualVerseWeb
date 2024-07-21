import * as yup from "yup";
import { useState } from "react";
import { Formik } from "formik";
import Dropzone from "react-dropzone";
// @mui
import {
    Box,
    TextField,
    useMediaQuery,
    Typography,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material"
import { LoadingButton } from "@mui/lab";
// icons
import SaveAltOutlinedIcon from '@mui/icons-material/SaveAltOutlined';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
// component
import FlexBetween from "components/FlexBetween";
// states
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "state";
// routes
import RestApiClient from "routes/RestApiClient";
import Apis from "routes/apis";
// utils
import { toast } from "react-toastify";
import ClipLoader from "react-spinners/ClipLoader";

const updateProfileSchema = yup.object().shape({
    firstName: yup.string().required("Required Field").min(2, 'Atleast 2 characters are required').max(20, 'Maximum 20 characters are allowed'),
    middleName: yup.string().max(15, 'Maximum 15 characters are allowed'),
    lastName: yup.string().required("Required Field").min(2, 'Atleast 2 characters are required').max(20, 'Maximum 20 characters are allowed'),
    location: yup.string().max(30, 'Maximum 30 characters are allowed'),
    occupation: yup.string().max(50, 'Maximum 50 characters are allowed'),
    picturePath: yup.string(),
});

const UpdateProfileWidget = (props) => {

    const { currentProfile, onClose, open, getUser } = props;
    const [isUploading, setIsUploading] = useState(false);      /* for is image uploading?  */

    const token = useSelector((state) => state.token);
    const isNonMobScreens = useMediaQuery("(min-width: 600px)");

    const { palette } = useTheme();
    const dispatch = useDispatch();
    const api = new RestApiClient(token);

    // colors
    const backgroundDefault = palette.background.default;
    const neutralMedium = palette.neutral.medium;
    const primaryMain = palette.primary.main;
    const neutralMain = palette.neutral.main;
    const backgroundAlt = palette.background.alt

    const initialProfileValue = {
        firstName: currentProfile?.firstName || "",
        middleName: currentProfile?.middleName || "",
        lastName: currentProfile?.lastName || "",
        location: currentProfile?.location || "",
        occupation: currentProfile?.occupation || "",
        picturePath: currentProfile?.picturePath || "",
    }

    // to update a profile
    const updateProfile = async (values, onSubmitProps) => {
        try {
            values.userId = currentProfile._id;
            const response = await api.put(Apis.user.update, values)

            if (response.result) {
                getUser();
                dispatch(
                    setUser({ user: response.user })
                );
                onClose();
                toast.success("Profile Updated Successfully!");
            } else {
                toast.error("Unable To Update The Profile");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while updating the profile.");
        }
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

    // submit update form
    const handleFormSubmit = async (values, onSubmitProps) => {
        await updateProfile(values, onSubmitProps);
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth='md'
            PaperProps={{
                sx: {
                    backgroundColor: backgroundDefault,
                    borderRadius: 3,
                },
            }}
        >
            <Formik
                onSubmit={handleFormSubmit}
                initialValues={initialProfileValue}
                validationSchema={updateProfileSchema}
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
                }) => (
                    <form onSubmit={handleSubmit}>
                        <DialogTitle fontFamily={"sans-serif"}>Update Profile</DialogTitle>
                        <DialogContent sx={{ mt: 2, height: 480, }}>
                            {/* INPUT FIELDS */}
                            <Box
                                display="grid"
                                gap="6%"
                                gridTemplateColumns="repeat(3, minmax(0, 1fr))"
                                sx={{ "& > div": { gridColumn: isNonMobScreens ? undefined : "span 3" }, mb: !isNonMobScreens ? "100px" : '0px' }}
                            >
                                <TextField
                                    label="First Name"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.firstName}
                                    name="firstName"
                                    error={Boolean(touched.firstName) && Boolean(errors.firstName)}
                                    helperText={touched.firstName && errors.firstName}
                                    sx={{ gridColumn: "span 1", mt: 1 }}
                                />
                                <TextField
                                    label="Middle Name"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.middleName}
                                    name="middleName"
                                    error={Boolean(touched.middleName) && Boolean(errors.middleName)}
                                    helperText={touched.middleName && errors.middleName}
                                    sx={{ gridColumn: "span 1", mt: 1 }}
                                />
                                <TextField
                                    label="Last Name"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.lastName}
                                    name="lastName"
                                    error={Boolean(touched.lastName) && Boolean(errors.lastName)}
                                    helperText={touched.lastName && errors.lastName}
                                    sx={{ gridColumn: "span 1", mt: 1 }}
                                />
                                <Box
                                    gridColumn="span 3"
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
                                                setFieldValue("picturePath", url);
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

                                                ) : !values.picturePath ? (
                                                    // Display drop image text with icon
                                                    <Box sx={{ display: 'flex', gap: 2, minHeight: { xs: 233, md: 167 }, alignItems: 'center', justifyContent: 'center' }}>
                                                        <Typography sx={{ color: neutralMain, }} variant="h4">Add Picture</Typography>
                                                        <SaveAltOutlinedIcon sx={{ fontSize: "1.5rem" }} />
                                                    </Box>
                                                ) : (
                                                    // Display image preview
                                                    <FlexBetween sx={{ "&:hover": { filter: values.picturePath && "brightness(0.5)" }, position: 'relative' }}>
                                                        <Box
                                                            component="img"
                                                            sx={{
                                                                width: "100%",
                                                                maxHeight: { xs: 233, md: 167 },
                                                                maxWidth: { xs: 350, md: 250 },
                                                            }}
                                                            alt="Uploaded"
                                                            src={values.picturePath}
                                                        />
                                                        <HighlightOffOutlinedIcon
                                                            sx={{
                                                                color: 'inherit',
                                                                fontSize: '1.5rem',
                                                                position: 'absolute',
                                                                top: 2,
                                                                right: 2,
                                                                cursor: 'pointer',
                                                            }}
                                                            onClick={() => setFieldValue('picturePath', '')}
                                                        />
                                                    </FlexBetween>
                                                )}
                                            </Box>
                                        )}
                                    </Dropzone>
                                </Box>
                                <TextField
                                    label="Location"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.location}
                                    name="location"
                                    error={Boolean(touched.location) && Boolean(errors.location)}
                                    helperText={touched.location && errors.location}
                                    sx={{ gridColumn: "span 3" }}
                                />
                                <TextField
                                    label="Occupation"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.occupation}
                                    name="occupation"
                                    error={Boolean(touched.occupation) && Boolean(errors.occupation)}
                                    helperText={touched.occupation && errors.occupation}
                                    sx={{ gridColumn: "span 3" }}
                                />
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ p: 3 }}>
                            <LoadingButton
                                sx={{
                                    backgroundColor: '#ff3333',
                                    color: backgroundAlt,
                                    borderRadius: "3rem",
                                    "&:hover": { color: '#ff3333' },
                                    width: '10%',
                                    height: '10%'
                                }}
                                onClick={onClose}>
                                Cancel
                            </LoadingButton>
                            <LoadingButton
                                sx={{
                                    backgroundColor: primaryMain,
                                    color: backgroundAlt,
                                    borderRadius: "3rem",
                                    "&:hover": { color: primaryMain },
                                    width: '10%',
                                    height: '10%'
                                }}
                                type="submit"
                            >
                                Update
                            </LoadingButton>
                        </DialogActions>
                    </form>
                )}
            </Formik>
        </Dialog>
    )
}

export default UpdateProfileWidget;