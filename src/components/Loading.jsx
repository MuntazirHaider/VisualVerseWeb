import React from 'react';
import Lottie from 'lottie-react';
import animationData from 'assets/animations/loading2';
import { Box } from '@mui/material';

const Loading = () => {

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Lottie animationData={animationData} loop={true} autoPlay={true} speed={2} />
        </Box>
    );
};

export default Loading;
