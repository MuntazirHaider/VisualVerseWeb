// react
import React, { useState } from 'react';
// @mui
import { Container, Box, Typography, Grid, Card, CardContent, Avatar, TextField, Button, Rating } from '@mui/material';
// icons
import { LockOutlined, DeleteForever, Chat, ContactMail, Feedback, Videocam } from '@mui/icons-material'
// utils
import { toast } from 'react-toastify';
// state
import { useSelector } from 'react-redux';
// routes
import RestApiClient from 'routes/RestApiClient';
import Apis from 'routes/apis';

const HelpSection = () => {
    const [rating, setRating] = useState(0);         // for rating
    const [suggestion, setSuggestion] = useState(''); // for suggestion

    const { _id } = useSelector((state) => state.user);
    const token = useSelector((state) => state.token);

    const api = new RestApiClient(token);

    const handleSubmit = async () => {
        if (rating === 0 && suggestion.trim() === '') {
            toast.error('Please provide a rating or a suggestion.');
            return;
        }
        try {
            const body = {
                userId: _id,
                rating,
                suggestion
            }
            const response = await api.post(`${Apis.feedback.index}`, body);
            if (response.result) {
                toast.success('Thank You For Sharing Your Feedback');
            }
        } catch (error) {

        }
        // Reset the form after submission
        setRating(0);
        setSuggestion('');
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h3" align="center" gutterBottom>
                Help & Support
            </Typography>
            <Typography variant="h6" align="center" paragraph>
                Welcome to Visual Verse! Here you'll find information on how to manage your account and get the support you need.
            </Typography>

            <Grid container spacing={4}>

                {/* video call */}
                {/* video call */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <Avatar sx={{ bgcolor: 'info.main', mb: 2 }}>
                                    <Videocam />
                                </Avatar>
                                <Typography variant="h5" component="div">
                                    Video Call
                                </Typography>
                                <Typography variant="body1" color="textSecondary">
                                    Visual Verse allows you to connect with other users via video calls seamlessly. If you face any issues, ensure you are connected to the internet and have allowed camera access.
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>


                {/* chat */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <Avatar sx={{ bgcolor: 'success.main', mb: 2 }}>
                                    <Chat />
                                </Avatar>
                                <Typography variant="h5" component="div">
                                    Chats
                                </Typography>
                                <Typography variant="body1" color="textSecondary">
                                    Visual Verse allows you to chat with other users seamlessly. For any issues with the chat feature, ensure you are connected to the internet and try refreshing the page.
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* forget password */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <Avatar sx={{ bgcolor: 'secondary.main', mb: 2 }}>
                                    <LockOutlined />
                                </Avatar>
                                <Typography variant="h5" component="div">
                                    Forgot Password
                                </Typography>
                                <Typography variant="body1" color="textSecondary">
                                    If you forget your password, you can reset it by clicking on the "Forgot Password" link on the login page. Follow the instructions sent to your email to reset your password.
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* delete  */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <Avatar sx={{ bgcolor: 'error.main', mb: 2 }}>
                                    <DeleteForever />
                                </Avatar>
                                <Typography variant="h5" component="div">
                                    Delete Account
                                </Typography>
                                <Typography variant="body1" color="textSecondary">
                                    To delete your account, go to your account settings and click on the "Delete Account" button. Please note that this action is irreversible and all your data will be permanently deleted.
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box mt={8}>
                <Typography variant="h4" align="center" gutterBottom>
                    Contact Us
                </Typography>
                <Typography variant="body1" align="center" paragraph>
                    If you need further assistance, please contact us at:
                </Typography>
                <Box display="flex" justifyContent="center" alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <ContactMail />
                    </Avatar>
                    <Typography variant="body1" color="textSecondary">
                        muntazirhaiderc320@gmail.com
                    </Typography>
                </Box>
            </Box>

            <Box mt={8}>
                <Typography variant="h4" align="center" gutterBottom>
                    Feedback
                </Typography>
                <Box display="flex" flexDirection="column" alignItems="center">
                    <Avatar sx={{ bgcolor: 'yellow', mb: 2 }}>
                        <Feedback />
                    </Avatar>
                    <Typography variant="body1" align="center" paragraph>
                        We value your feedback! Please rate your experience and provide any suggestions you have to help us improve.
                    </Typography>
                    <Rating
                        name="rating"
                        value={rating}
                        onChange={(event, newValue) => {
                            setRating(newValue);
                        }}
                    />
                    <TextField
                        label="Your Suggestion"
                        multiline
                        rows={4}
                        value={suggestion}
                        onChange={(event) => setSuggestion(event.target.value)}
                        variant="outlined"
                        sx={{ mt: 2, width: '80%' }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={handleSubmit}
                    >
                        Submit Feedback
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default HelpSection;
