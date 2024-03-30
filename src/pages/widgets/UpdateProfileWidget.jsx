import * as yup from "yup";
import { Formik } from "formik";
import Dropzone from "react-dropzone";
// @mui
import {
    Box,
    Button,
    TextField,
    useMediaQuery,
    Typography,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
// component
import FlexBetween from "components/FlexBetween";
// states
import { useSelector } from "react-redux";
// utils
import { toast } from "react-toastify";



const updateProfileSchema = yup.object().shape({
    firstName: yup.string().required("Required Field").min(2, 'Atleast 2 characters are required').max(20, 'Maximum 20 characters are allowed'),
    middleName: yup.string().max(15, 'Maximum 15 characters are allowed'),
    lastName: yup.string().required("Required Field").min(2, 'Atleast 2 characters are required').max(20, 'Maximum 20 characters are allowed'),
    location: yup.string().max(30, 'Maximum 30 characters are allowed'),
    occupation: yup.string().max(50, 'Maximum 50 characters are allowed'),
    picture: yup.string(),
});


const UpdateProfileWidget = (props) => {
    const { currentProfile, onClose, open, getUser } = props;
    const { palette } = useTheme();
    const token = useSelector((state) => state.token);
    const isNonMobScreens = useMediaQuery("(min-width: 600px)");

    const dialogBackground = palette.background.default;

    const initialProfileValue = {
        firstName: currentProfile?.firstName || "",
        middleName: currentProfile?.middleName || "",
        lastName: currentProfile?.lastName || "",
        location: currentProfile?.location || "",
        occupation: currentProfile?.occupation || "",
        picture: currentProfile?.picturePath || "",
    }

    const updateWithOutImage = async (values, onSubmitProps) => {
        try {
            const body = {
                "userId": currentProfile._id,
                "firstName": values.firstName,
                "middleName": values.middleName,
                "lastName": values.lastName,
                "location": values.location,
                "occupation": values.occupation
            }
            const updateUserResponse = await fetch(
                "http://localhost:3001/users/update",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(body),
                }
            );

            const response = await updateUserResponse.json();
            console.log("Response", response);

            if (response.result) {
                getUser();
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


    const handleFormSubmit = async (values, onSubmitProps) => {
        console.log("Form submitted with values:", values);
        await updateWithOutImage(values, onSubmitProps);
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth='md'
            PaperProps={{
                sx: {
                    backgroundColor: dialogBackground,
                    borderRadius: 3
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
                        <DialogContent sx={{ height: "325px", overflowY: "auto", mt: 2 }}>
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
                                    border={`1px solid ${palette.neutral.medium}`}
                                    borderRadius="5px"
                                    p="1rem"
                                >
                                    <Dropzone
                                        acceptedFiles=".jpeg,.jpg,.png"
                                        multiple={false}
                                        onDrop={(acceptedFiles) =>
                                            setFieldValue("picture", acceptedFiles[0])
                                        }
                                    >
                                        {({ getRootProps, getInputProps }) => (
                                            <Box
                                                {...getRootProps()}
                                                border={`2px dashed ${palette.primary.main}`}
                                                p="1rem"
                                                sx={{ "&:hover": { cursor: "pointer" } }}
                                            >
                                                <input {...getInputProps()} />
                                                {!values.picture ? (
                                                    <Typography sx={{ color: palette.neutral.main }}>Update picture here</Typography>
                                                ) : (
                                                    <FlexBetween>
                                                        <Typography>{values.picture?.name || values.picture}</Typography>
                                                        <EditOutlinedIcon />
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
                            <Button
                                sx={{
                                    backgroundColor: '#ff3333',
                                    color: palette.background.alt,
                                    borderRadius: "3rem",
                                    "&:hover": { color: '#ff3333' },
                                    width: '10%',
                                    height: '10%'
                                }}
                                onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                sx={{
                                    backgroundColor: palette.primary.main,
                                    color: palette.background.alt,
                                    borderRadius: "3rem",
                                    "&:hover": { color: palette.primary.main },
                                    width: '10%',
                                    height: '10%'
                                }}
                                type="submit"
                            >
                                Update
                            </Button>
                        </DialogActions>
                    </form>
                )}
            </Formik>
        </Dialog>
    )
}

export default UpdateProfileWidget;