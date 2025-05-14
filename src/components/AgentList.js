import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorIcon from '@mui/icons-material/Error';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import JsonViewer from './JsonViewer';
import { exportAgents, importAgents } from '../services/agentStorage';

function AgentList({ agents, selectedAgent, onAddAgent, onRemoveAgent, onSelectAgent, fetchAgentCard, onOpenAbout, onOpenSettings }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [newAgentUrl, setNewAgentUrl] = useState('http://localhost:10000');
  const [importText, setImportText] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [importError, setImportError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({});
  const [copySuccess, setCopySuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const fileInputRef = useRef(null);

  // Check connection status for all agents periodically
  useEffect(() => {
    const checkConnections = async () => {
      const newStatus = { ...connectionStatus };
      
      for (const agent of agents) {
        try {
          newStatus[agent.id] = { checking: true };
          setConnectionStatus({ ...newStatus });
          
          const response = await fetch(`${agent.url}/.well-known/agent.json`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            // Short timeout to prevent long waits
            signal: AbortSignal.timeout(3000)
          });
          
          if (response.ok) {
            newStatus[agent.id] = { connected: true, lastChecked: new Date().toISOString() };
          } else {
            newStatus[agent.id] = { 
              connected: false, 
              error: `HTTP ${response.status}`, 
              lastChecked: new Date().toISOString() 
            };
          }
        } catch (error) {
          newStatus[agent.id] = { 
            connected: false, 
            error: error.name === 'TimeoutError' ? 'Timeout' : error.message,
            lastChecked: new Date().toISOString()
          };
        }
      }
      
      setConnectionStatus(newStatus);
    };
    
    // Initial check
    checkConnections();
    
    // Set up periodic checking
    const interval = setInterval(checkConnections, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [agents]);

  const handleOpenMenu = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
    setValidationError(null);
    handleCloseMenu();
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    // Reset form fields
    setNewAgentUrl('http://localhost:10000');
    setIsValidating(false);
    setValidationError(null);
  };

  const handleOpenImportDialog = () => {
    setImportDialogOpen(true);
    setImportError(null);
    setImportText('');
    handleCloseMenu();
  };

  const handleCloseImportDialog = () => {
    setImportDialogOpen(false);
    setImportError(null);
    setImportText('');
  };

  const handleExportAgents = () => {
    try {
      const exportData = exportAgents();
      
      // Create a blob with the data
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a link and click it to download
      const link = document.createElement('a');
      link.href = url;
      link.download = `a2a-agents-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      setSuccessMessage('Agents exported successfully');
      setCopySuccess(true);
      handleCloseMenu();
    } catch (error) {
      console.error('Error exporting agents:', error);
      setSuccessMessage(`Export failed: ${error.message}`);
      setCopySuccess(true);
    }
  };

  const handleImportFromText = () => {
    try {
      if (!importText.trim()) {
        setImportError('Please enter agent configuration data');
        return;
      }
      
      const importedAgents = importAgents(importText);
      onAddAgent(importedAgents);
      
      setSuccessMessage(`Imported ${importedAgents.length} agent(s) successfully`);
      setCopySuccess(true);
      handleCloseImportDialog();
    } catch (error) {
      setImportError(error.message);
    }
  };

  const handleImportFromFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const importedAgents = importAgents(content);
        onAddAgent(importedAgents);
        
        setSuccessMessage(`Imported ${importedAgents.length} agent(s) successfully`);
        setCopySuccess(true);
        handleCloseMenu();
      } catch (error) {
        setSuccessMessage(`Import failed: ${error.message}`);
        setCopySuccess(true);
      }
    };
    
    reader.onerror = () => {
      setSuccessMessage('Failed to read file');
      setCopySuccess(true);
    };
    
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
    handleCloseMenu();
  };

  const validateAndAddAgent = async () => {
    if (!newAgentUrl) return;
    
    try {
      setIsValidating(true);
      setValidationError(null);
      
      // Create a temporary client to fetch the agent card
      const response = await fetch(`${newAgentUrl}/.well-known/agent.json`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch agent card: ${response.status} ${response.statusText}`);
      }
      
      const agentCard = await response.json();
      
      if (!agentCard || !agentCard.name) {
        throw new Error('Invalid agent card: missing required fields');
      }
      
      const newAgent = {
        id: uuidv4(),
        name: agentCard.name,
        url: newAgentUrl,
        description: agentCard.description || '',
        version: agentCard.version || '',
        provider: agentCard.provider || '',
        streaming: agentCard.capabilities?.streaming || false,
        card: agentCard
      };
      
      onAddAgent(newAgent);
      handleCloseDialog();
    } catch (error) {
      setValidationError(error.message);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRefreshAgent = async (e, agentId) => {
    e.stopPropagation(); // Prevent selecting the agent
    
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;
    
    // Update connection status to checking
    setConnectionStatus(prev => ({
      ...prev,
      [agentId]: { checking: true }
    }));
    
    try {
      // Fetch the agent card
      const response = await fetch(`${agent.url}/.well-known/agent.json`, {
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch agent card: ${response.status} ${response.statusText}`);
      }
      
      const agentCard = await response.json();
      
      // Update agent with new card data
      const updatedAgent = {
        ...agent,
        name: agentCard.name,
        description: agentCard.description || '',
        version: agentCard.version || '',
        provider: agentCard.provider || '',
        streaming: agentCard.capabilities?.streaming || false,
        card: agentCard
      };
      
      // Update the agents list
      const updatedAgents = agents.map(a => a.id === agentId ? updatedAgent : a);
      onAddAgent(updatedAgents);
      
      // Update connection status
      setConnectionStatus(prev => ({
        ...prev,
        [agentId]: { connected: true, lastChecked: new Date().toISOString() }
      }));
      
    } catch (error) {
      // Update connection status with error
      setConnectionStatus(prev => ({
        ...prev,
        [agentId]: { 
          connected: false, 
          error: error.name === 'TimeoutError' ? 'Timeout' : error.message,
          lastChecked: new Date().toISOString()
        }
      }));
    }
  };

  const handleCopyUrl = (e, url) => {
    e.stopPropagation(); // Prevent selecting the agent
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy URL: ', err);
      });
  };

  // Renders additional information for an agent if available
  const renderAgentDetails = (agent) => {
    if (!agent) return null;
    
    return (
      <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {agent.version && (
          <Typography variant="caption" color="text.secondary">
            Version: {agent.version}
          </Typography>
        )}
        
        {agent.provider && (
          <Typography variant="caption" color="text.secondary">
            Provider: {agent.provider}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
          <Chip 
            size="small"
            icon={agent.streaming ? <CheckIcon fontSize="small" /> : <CloseIcon fontSize="small" />}
            label="Streaming"
            color={agent.streaming ? "success" : "default"}
            variant="outlined"
            sx={{ height: 20 }}
          />
          {agent.card && agent.card.capabilities && (
            <Chip 
              size="small"
              icon={agent.card.capabilities.pushNotifications ? <CheckIcon fontSize="small" /> : <CloseIcon fontSize="small" />}
              label="Push Notif"
              color={agent.card.capabilities.pushNotifications ? "success" : "default"}
              variant="outlined"
              sx={{ height: 20 }}
            />
          )}
          {agent.card && (
            <JsonViewer 
              data={agent.card} 
              buttonLabel="Card" 
              buttonSize="small" 
              buttonVariant="text" 
              buttonColor="default"
            />
          )}
        </Box>
      </Box>
    );
  };

  // Render connection status indicator
  const renderConnectionStatus = (agentId) => {
    const status = connectionStatus[agentId];
    
    if (!status) {
      return (
        <CircularProgress size={14} thickness={4} />
      );
    }
    
    if (status.checking) {
      return (
        <CircularProgress size={14} thickness={4} />
      );
    }
    
    if (status.connected) {
      return (
        <Tooltip title={`Connected - Last checked: ${new Date(status.lastChecked).toLocaleTimeString()}`}>
          <Box component="span" sx={{ display: 'inline-flex' }}>
            <Badge color="success" variant="dot" sx={{ '& .MuiBadge-badge': { right: 3, top: 3 } }}>
              <CircularProgress size={14} thickness={4} 
                variant="determinate" 
                value={100} 
                sx={{ color: 'success.main' }} 
              />
            </Badge>
          </Box>
        </Tooltip>
      );
    }
    
    return (
      <Tooltip title={`Error: ${status.error} - Last checked: ${new Date(status.lastChecked).toLocaleTimeString()}`}>
        <Box component="span" sx={{ display: 'inline-flex' }}>
          <Badge color="error" variant="dot" sx={{ '& .MuiBadge-badge': { right: 3, top: 3 } }}>
            <CircularProgress size={14} thickness={4} 
              variant="determinate" 
              value={100} 
              sx={{ color: 'error.main' }}
            />
          </Badge>
        </Box>
      </Tooltip>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".json"
        onChange={handleImportFromFile}
      />
      
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Agents</Typography>
        <Box>
          <IconButton 
            color="primary" 
            onClick={handleOpenMenu}
            data-testid="agent-list-add-button"
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleCloseMenu}
          >
            <MenuItem onClick={handleOpenDialog}>
              <AddIcon fontSize="small" sx={{ mr: 1 }} />
              Add Agent
            </MenuItem>
            <MenuItem onClick={triggerFileInput}>
              <UploadIcon fontSize="small" sx={{ mr: 1 }} />
              Import from File
            </MenuItem>
            <MenuItem onClick={handleOpenImportDialog}>
              <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />
              Import from Text
            </MenuItem>
            <MenuItem onClick={handleExportAgents} disabled={agents.length === 0}>
              <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
              Export Agents
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      
      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {agents.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No agents added yet.
            </Typography>
            <Button 
              startIcon={<AddIcon />}
              variant="outlined"
              size="small"
              onClick={handleOpenDialog}
              sx={{ mt: 1 }}
            >
              Add Agent
            </Button>
          </Box>
        ) : (
          agents.map(agent => (
            <ListItem
              key={agent.id}
              secondaryAction={
                <Box sx={{ display: 'flex' }}>
                  <IconButton 
                    size="small" 
                    onClick={(e) => handleRefreshAgent(e, agent.id)} 
                    sx={{ mr: 1 }}
                    color="primary"
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                  <IconButton edge="end" onClick={() => onRemoveAgent(agent.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
              disablePadding
              sx={{ 
                bgcolor: selectedAgent?.id === agent.id ? 'rgba(122, 140, 179, 0.15)' : 'transparent',
                borderLeft: selectedAgent?.id === agent.id ? '3px solid #7a8cb3' : '3px solid transparent'
              }}
            >
              <ListItemButton
                selected={selectedAgent?.id === agent.id}
                onClick={() => onSelectAgent(agent)}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: agent.card ? '#3f4d6a' : '#1f2a45' }}>
                    <SmartToyIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {renderConnectionStatus(agent.id)}
                      <Typography variant="body1" component="span" sx={{ ml: 1 }}>
                        {agent.name}
                      </Typography>
                      {agent.card && (
                        <InfoIcon sx={{ ml: 0.5, fontSize: 16, color: 'text.secondary' }} />
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="caption" component="span" sx={{ display: 'block', wordBreak: 'break-word', flexGrow: 1 }}>
                          {agent.url}
                        </Typography>
                        <Tooltip title="Copy URL">
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleCopyUrl(e, agent.url)}
                            sx={{ ml: 0.5 }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      {renderAgentDetails(agent)}
                    </>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>
      
      {/* Bottom buttons for About and Settings */}
      <Box sx={{ 
        borderTop: '1px solid rgba(255, 255, 255, 0.12)', 
        p: 1, 
        display: 'flex',
        justifyContent: 'space-around'
      }}>
        <Button 
          startIcon={<HelpIcon />} 
          onClick={onOpenAbout}
          sx={{ flex: 1, mr: 1 }}
          color="primary"
          variant="text"
        >
          About
        </Button>
        <Divider orientation="vertical" flexItem />
        <Button 
          startIcon={<SettingsIcon />} 
          onClick={onOpenSettings}
          sx={{ flex: 1, ml: 1 }}
          color="primary"
          variant="text"
        >
          Settings
        </Button>
      </Box>
      
      {/* Add Agent Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Agent</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Enter the A2A agent URL. The application will automatically validate and load the agent's capabilities.
          </Typography>
          
          <TextField
            autoFocus
            margin="dense"
            label="Agent URL"
            fullWidth
            variant="outlined"
            value={newAgentUrl}
            onChange={(e) => setNewAgentUrl(e.target.value)}
            helperText={validationError || "E.g., http://localhost:10000"}
            error={!!validationError}
            disabled={isValidating}
          />
          
          {validationError && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {validationError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={validateAndAddAgent} 
            variant="contained" 
            disabled={!newAgentUrl || isValidating}
            startIcon={isValidating ? <CircularProgress size={16} /> : null}
          >
            {isValidating ? 'Validating...' : 'Add Agent'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={handleCloseImportDialog} maxWidth="md" fullWidth>
        <DialogTitle>Import Agents</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Paste the agent configuration JSON below. This will add or update agents in your list.
          </Typography>
          
          <TextField
            autoFocus
            margin="dense"
            label="Agent Configuration JSON"
            fullWidth
            variant="outlined"
            multiline
            rows={10}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            helperText={importError || "Paste exported agent configuration JSON here"}
            error={!!importError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImportDialog}>Cancel</Button>
          <Button 
            onClick={handleImportFromText} 
            variant="contained" 
            disabled={!importText.trim()}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={copySuccess} 
        autoHideDuration={4000} 
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setCopySuccess(false)} severity="success">
          {successMessage || "Action completed successfully"}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AgentList; 