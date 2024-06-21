import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Button,
  TextField,
  Typography,
  Container,
  Grid,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Delete as DeleteIcon, Publish as PublishIcon } from '@mui/icons-material';
import './App.css';
import { uploadFile } from './uploadFile';

const formatFileSize = (size) => {
  if (size < 1024) return `${size} B`;
  else if (size < 1048576) return `${(size / 1024).toFixed(2)} KB`;
  else if (size < 1073741824) return `${(size / 1048576).toFixed(2)} MB`;
  else return `${(size / 1073741824).toFixed(2)} GB`;
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const validateObjectId = (id) => {
  const re = /^[0-9A-Za-z]+$/;
  return re.test(String(id));
};

function App() {
  const [files, setFiles] = useState([]);
  const [email, setEmail] = useState('');
  const [hubspotObjectId, setHubspotObjectId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [alert, setAlert] = useState({ open: false, severity: '', message: '' });
  const [secondAlert, setSecondAlert] = useState({ open: false, severity: '', message: '' });

  const [accessToken] = useState(''); // Armazena o token de acesso

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles([...files, ...acceptedFiles]);
    },
  });

  const handleUpload = async () => {
    let errorMessages = [];

    if (!email) {
      errorMessages.push('Email is required.');
    }

    if (!hubspotObjectId) {
      errorMessages.push('HubSpot Object ID is required.');
    }

    if (email && !validateEmail(email)) {
      errorMessages.push('Invalid email address.');
    }

    if (hubspotObjectId && !validateObjectId(hubspotObjectId)) {
      errorMessages.push('Invalid HubSpot Object ID.');
    }

    if (files.length === 0) {
      errorMessages.push('No files selected for upload.');
    }

    if (errorMessages.length > 0) {
      setAlert({ open: true, severity: 'error', message: errorMessages.join(' ') });
      return;
    }

    setIsButtonClicked(true);
    setIsUploading(true);

    const result = await uploadFile(files, email, hubspotObjectId, accessToken);

    if (result.success) {
      setAlert({ open: true, severity: 'success', message: 'Files uploaded successfully.' });
      setFiles([]); // Limpa a lista de arquivos após upload bem-sucedido
    } else {
      if (result.error.includes('In alternative, you are not authenticated or your session has expired. Please log in again using the Microsoft authentication extension card.')) {
        setSecondAlert({ open: true, severity: 'error', message: 'Upload failed. Please check your email and ID.' });
        setAlert({ open: true, severity: 'error', message: result.error });
      } else {
        setAlert({ open: true, severity: 'error', message: result.error });
      }
    }

    setIsUploading(false);
    setIsButtonClicked(false);
  };

  const handleRemoveFile = (file) => {
    setFiles(files.filter((f) => f.path !== file.path));
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const handleCloseSecondAlert = () => {
    setSecondAlert({ ...secondAlert, open: false });
  };

  return (
    <div className="main-container" style={{ maxHeight: '100vh', overflowY: 'scroll' }}>
      <Container maxWidth="md" className="mt-5">
        <Paper elevation={6} className="paper-container scale-down" style={paperStyle}>
          <Box display="flex" justifyContent="space-between" alignItems="center" style={{ position: 'relative' }}>
            <Typography variant="h4" gutterBottom>
              <strong>Upload to SharePoint</strong>
            </Typography>
            <a href="https://findmore.solutions/" target="_blank" rel="noopener noreferrer">
              <img src="/logo.png" alt="Logo" className="logo" />
            </a>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email:"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={textFieldStyle}
                InputProps={{
                  classes: {
                    root: 'customTextFieldRoot',
                    focused: 'customTextFieldFocused',
                    notchedOutline: 'customNotchedOutline',
                  },
                }}
                InputLabelProps={{
                  classes: {
                    root: 'customLabelRoot',
                    focused: 'customLabelFocused',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <TextField
                  fullWidth
                  label="Folder ID:"
                  variant="outlined"
                  value={hubspotObjectId}
                  onChange={(e) => setHubspotObjectId(e.target.value)}
                  style={textFieldStyle}
                  InputProps={{
                    classes: {
                      root: 'customTextFieldRoot',
                      focused: 'customTextFieldFocused',
                      notchedOutline: 'customNotchedOutline',
                    },
                  }}
                  InputLabelProps={{
                    classes: {
                      root: 'customLabelRoot',
                      focused: 'customLabelFocused',
                    },
                  }}
                />
              </Box>
            </Grid>

            <Grid container item xs={12} style={{ display: 'flex', alignItems: 'center' }}>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpload}
                  startIcon={<PublishIcon />}
                  className={isButtonClicked ? 'buttonClicked' : ''}
                  style={buttonStyle}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </Grid>
              <Grid item style={{ marginLeft: 'auto' }}>
                <Box style={{ display: 'flex', gap: '10px', margin: '10px' }}>
                  <a href="https://www.microsoft.com" target="_blank" rel="noopener noreferrer">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/0/0f/Microsoft_logo_-_2012_%28vertical%29.svg" alt="Microsoft" className="icon" />
                  </a>
                  <a href="https://www.microsoft.com/en-us/microsoft-365/sharepoint/collaboration" target="_blank" rel="noopener noreferrer">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Microsoft_Office_SharePoint_%282019%E2%80%93present%29.svg" alt="SharePoint" className="icon" />
                  </a>
                  <a href="https://www.hubspot.com" target="_blank" rel="noopener noreferrer">
                    <img src="https://i.pinimg.com/originals/68/9a/ba/689abaa7ca6cdf1f95c768ef4af64001.png" alt="HubSpot" className="icon" />
                  </a>
                </Box>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <div
                {...getRootProps({ className: `dropzone ${isUploading ? 'uploading' : ''}` })}
                style={{
                  ...dropzoneStyle,
                  backgroundColor: isDragActive ? 'rgba(63, 151, 157, 0.2)' : '#ffdcc7',
                  transition: 'background-color 0.3s, border-color 0.3s',
                }}
              >
                <input {...getInputProps()} />
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                  <CloudUploadIcon style={{ fontSize: 50, color: '#ff5722', transition: 'transform 0.3s', transform: isDragActive ? 'scale(1.2)' : 'scale(1)' }} />
                  <Typography variant="body1" style={{ marginTop: '1rem', transition: 'color 0.3s', color: isDragActive ? '#3f979d' : '#ff5722' }}>
                    Drag and drop files here, or click to select files
                  </Typography>
                </Box>
              </div>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h5">Selected Files:</Typography>
              <Box style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {files.map((file, index) => (
                        <TableRow key={index}>
                          <TableCell>{file.name}</TableCell>
                          <TableCell>{formatFileSize(file.size)}</TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleRemoveFile(file)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
      <Snackbar open={secondAlert.open} autoHideDuration={8000} onClose={handleCloseSecondAlert}>
        <Alert onClose={handleCloseSecondAlert} severity={secondAlert.severity} sx={{ width: '100%', marginBottom: '60px' }}>
          {secondAlert.message}
        </Alert>
      </Snackbar>
      <Snackbar open={alert.open} autoHideDuration={8000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

const paperStyle = {
  borderRadius: '10px',
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  backgroundColor: '#f5f8fa',
};

const textFieldStyle = {
  marginBottom: '1rem',
};

const dropzoneStyle = {
  border: '2px dashed #ff5722',
  borderRadius: '10px',
  padding: '2rem',
  textAlign: 'center',
  cursor: 'pointer',
};

const buttonStyle = {
  marginTop: '1rem',
  padding: '0.75rem 1.5rem',
  fontSize: '1rem',
  backgroundColor: '#3f979d',
  color: '#fff',
};

export default App;
