import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { saveSettings, resetSettings } from '../services/settingsStorage';

function SettingsView({ logEnabled, onLogEnabledChange }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Settings updated successfully');
  const [localLogEnabled, setLocalLogEnabled] = useState(logEnabled);
  
  // Update local state when props change
  useEffect(() => {
    setLocalLogEnabled(logEnabled);
  }, [logEnabled]);
  
  // Handle log toggle
  const handleLogToggle = (checked) => {
    setLocalLogEnabled(checked);
  };
  
  // Save settings
  const handleSaveSettings = () => {
    // Apply settings
    onLogEnabledChange(localLogEnabled);
    
    // Save settings to storage
    saveSettings({ logEnabled: localLogEnabled });
    
    // Show success message
    setSuccessMessage('Settings updated successfully');
    setShowSuccess(true);
  };
  
  // Reset settings to defaults
  const handleResetSettings = () => {
    const defaultSettings = resetSettings();
    
    // Apply default settings
    setLocalLogEnabled(defaultSettings.logEnabled);
    onLogEnabledChange(defaultSettings.logEnabled);
    
    // Show success message
    setSuccessMessage('Settings reset to defaults');
    setShowSuccess(true);
  };

  return (
    <Box sx={{ 
      p: 3, 
      height: '100%',
      width: '100%',
      position: 'absolute',
      overflow: 'auto'
    }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Application settings and preferences
      </Typography>
      
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Debugging
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <FormGroup>
          <FormControlLabel 
            control={
              <Switch 
                checked={localLogEnabled} 
                onChange={(e) => handleLogToggle(e.target.checked)} 
              />
            } 
            label="Enable Logging" 
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            When disabled, the debug logs panel will be hidden.
          </Typography>
        </FormGroup>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button 
          variant="outlined" 
          color="secondary"
          startIcon={<RestartAltIcon />} 
          onClick={handleResetSettings}
        >
          Reset to Defaults
        </Button>
        
        <Button 
          variant="contained" 
          startIcon={<SaveIcon />} 
          onClick={handleSaveSettings}
        >
          Save Settings
        </Button>
      </Box>
      
      <Snackbar 
        open={showSuccess} 
        autoHideDuration={2000} 
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default SettingsView; 