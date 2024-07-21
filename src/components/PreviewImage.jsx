import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '75%',
    minWidth: 100,
    maxWidth: 450,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const PreviewImage = ({ open, handleClosePreview, img }) => {
    return (
        <>
            <Modal
                open={open}
                onClose={handleClosePreview}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <img
                        width="100%"
                        height="100%"
                        style={{ borderRadius: "0.75rem", marginTop: "0.75rem", objectFit: 'cover', maxHeight: '650px', }}
                        src={img}
                        alt="post"
                    />
                </Box>
            </Modal>
        </>
    )
}

export default PreviewImage