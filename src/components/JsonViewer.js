import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import CodeIcon from '@mui/icons-material/Code';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

function JsonViewer({ 
  data, 
  buttonLabel = "Raw", 
  buttonSize = "small", 
  buttonVariant = "outlined",
  buttonIcon = <CodeIcon />
}) {
  const [open, setOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const handleOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  const handleCopy = () => {
    const jsonString = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(jsonString)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy JSON: ', err);
      });
  };

  // Format the JSON with 2 spaces for indentation
  const formattedJson = JSON.stringify(data, null, 2);

  return (
    <>
      <Box component="span" sx={{ '& .MuiButton-root': { minWidth: 'auto' } }}>
        <Button
          size={buttonSize}
          variant={buttonVariant}
          onClick={handleOpen}
          startIcon={buttonIcon}
          sx={{ color: '#7a8cb3' }}
        >
          {buttonLabel}
        </Button>
      </Box>
      
      <Dialog 
        open={open} 
        onClose={handleClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#1f2a45' }}>
          <Box>Complete API Response</Box>
          <Box>
            <Tooltip title="Copy JSON">
              <IconButton onClick={handleCopy} sx={{ color: '#7a8cb3' }} size="small">
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: '#0d162e' }}>
          <Box 
            component="pre" 
            sx={{ 
              backgroundColor: '#0d162e', 
              color: '#d0d8e8', 
              p: 2, 
              borderRadius: 1, 
              overflow: 'auto',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              maxHeight: '70vh'
            }}
          >
            {formattedJson}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={copySuccess} 
        autoHideDuration={2000} 
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setCopySuccess(false)} severity="success">
          JSON copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
}

export default JsonViewer; 