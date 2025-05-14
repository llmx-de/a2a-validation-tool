import React, { useState, useRef, useEffect } from 'react';
import { Box, Tabs, Tab, Typography, Button, Divider, Paper, Chip } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import JsonViewer from './JsonViewer';

function LogViewer({ logs, onClearLogs }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const logContainerRef = useRef(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const toggleOpen = () => {
    setOpen(!open);
  };

  // Auto-scroll to bottom of logs
  useEffect(() => {
    if (open && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, open]);

  // Filter logs based on active tab
  const filteredLogs = logs.filter(log => {
    if (activeTab === 0) return true; // All logs
    if (activeTab === 1) return log.type === 'info';
    if (activeTab === 2) return log.type === 'warn' || log.type === 'error';
    return true;
  });

  const getTypeColor = (type) => {
    switch(type) {
      case 'error': return 'error';
      case 'warn': return 'warning';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 0, right: 20, zIndex: 1000 }}>
      {open ? (
        <Paper 
          elevation={4} 
          sx={{ 
            width: '80vw', 
            height: '300px', 
            maxWidth: '1200px',
            display: 'flex',
            flexDirection: 'column',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            px: 2,
            py: 1,
            bgcolor: 'primary.dark'
          }}>
            <Typography variant="h6" sx={{ color: 'white' }}>Debug Logs</Typography>
            <Box>
              <Button 
                color="inherit" 
                size="small" 
                onClick={onClearLogs} 
                startIcon={<ClearIcon />}
                sx={{ color: 'white', mr: 1 }}
              >
                Clear
              </Button>
              <Button 
                color="inherit" 
                size="small" 
                onClick={toggleOpen}
                sx={{ color: 'white' }}
              >
                Close
              </Button>
            </Box>
          </Box>
          
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ bgcolor: 'background.paper' }}
          >
            <Tab label="All" />
            <Tab label="Info" />
            <Tab label="Warnings/Errors" />
          </Tabs>
          
          <Box 
            ref={logContainerRef}
            sx={{ 
              flexGrow: 1, 
              overflow: 'auto', 
              px: 2, 
              py: 1,
              bgcolor: '#1e1e1e'
            }}
          >
            {filteredLogs.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', textAlign: 'center', mt: 2 }}>
                No logs to display
              </Typography>
            ) : (
              filteredLogs.map((log, index) => (
                <Box key={index} sx={{ mb: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: '80px' }}>
                      {log.timestamp}
                    </Typography>
                    <Chip 
                      label={log.type.toUpperCase()} 
                      size="small" 
                      color={getTypeColor(log.type)}
                      sx={{ mr: 1, height: 20, fontSize: '0.7rem' }}
                    />
                    <Typography variant="body2" sx={{ color: 'white', flexGrow: 1 }}>
                      {log.message}
                    </Typography>
                    {log.data && (
                      <Box sx={{ ml: 1 }}>
                        <JsonViewer 
                          data={log.data} 
                          buttonLabel="Data" 
                          buttonSize="small" 
                          buttonVariant="text" 
                          buttonColor="default"
                        />
                      </Box>
                    )}
                  </Box>
                  {index < filteredLogs.length - 1 && <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />}
                </Box>
              ))
            )}
          </Box>
        </Paper>
      ) : (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={toggleOpen}
          sx={{ borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          Logs ({logs.length})
        </Button>
      )}
    </Box>
  );
}

export default LogViewer; 