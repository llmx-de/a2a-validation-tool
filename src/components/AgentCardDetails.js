import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import LabelIcon from '@mui/icons-material/Label';
import InfoIcon from '@mui/icons-material/Info';
import CodeIcon from '@mui/icons-material/Code';
import ListAltIcon from '@mui/icons-material/ListAlt';
import JsonViewer from './JsonViewer';

function AgentCardDetails({ agentCard, isLoading }) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading agent card...</Typography>
      </Box>
    );
  }

  if (!agentCard) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Agent card information not available. Try selecting a different agent.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100%',
      width: '100%',
      position: 'absolute',
      overflowY: 'auto',
      padding: 2,
      boxSizing: 'border-box'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">{agentCard.name || 'Unknown Agent'}</Typography>
        <JsonViewer data={agentCard} buttonLabel="View Raw Card" buttonColor="primary" />
      </Box>
      
      {agentCard.description && (
        <Typography variant="body1" paragraph>{agentCard.description}</Typography>
      )}
      
      {/* Basic Information */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          <InfoIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
          Basic Information
        </Typography>
        
        <List dense disablePadding>
          <ListItem>
            <ListItemText 
              primary="URL" 
              secondary={agentCard.url || 'Not specified'} 
            />
          </ListItem>
          
          {agentCard.version && (
            <ListItem>
              <ListItemText 
                primary="Version" 
                secondary={agentCard.version} 
              />
            </ListItem>
          )}
          
          {agentCard.provider && (
            <ListItem>
              <ListItemText 
                primary="Provider" 
                secondary={agentCard.provider} 
              />
            </ListItem>
          )}
          
          {agentCard.documentationUrl && (
            <ListItem>
              <ListItemText 
                primary="Documentation" 
                secondary={
                  <a 
                    href={agentCard.documentationUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#90caf9' }}
                  >
                    {agentCard.documentationUrl}
                  </a>
                } 
              />
            </ListItem>
          )}
        </List>
      </Paper>
      
      {/* Capabilities */}
      {agentCard.capabilities && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            <CodeIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
            Capabilities
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip 
              icon={agentCard.capabilities.streaming ? <CheckIcon /> : <CloseIcon />}
              label="Streaming" 
              color={agentCard.capabilities.streaming ? "success" : "default"}
              variant={agentCard.capabilities.streaming ? "filled" : "outlined"}
            />
            <Chip 
              icon={agentCard.capabilities.pushNotifications ? <CheckIcon /> : <CloseIcon />}
              label="Push Notifications" 
              color={agentCard.capabilities.pushNotifications ? "success" : "default"}
              variant={agentCard.capabilities.pushNotifications ? "filled" : "outlined"}
            />
            <Chip 
              icon={agentCard.capabilities.stateTransitionHistory ? <CheckIcon /> : <CloseIcon />}
              label="State Transition History" 
              color={agentCard.capabilities.stateTransitionHistory ? "success" : "default"}
              variant={agentCard.capabilities.stateTransitionHistory ? "filled" : "outlined"}
            />
          </Box>
        </Paper>
      )}
      
      {/* Input/Output Modes */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          <ListAltIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
          Supported Formats
        </Typography>
        
        <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
          Input Modes:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {agentCard.defaultInputModes && agentCard.defaultInputModes.length > 0 ? (
            agentCard.defaultInputModes.map((mode, index) => (
              <Chip key={index} size="small" label={mode} />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">None specified</Typography>
          )}
        </Box>
        
        <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
          Output Modes:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {agentCard.defaultOutputModes && agentCard.defaultOutputModes.length > 0 ? (
            agentCard.defaultOutputModes.map((mode, index) => (
              <Chip key={index} size="small" label={mode} />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">None specified</Typography>
          )}
        </Box>
      </Paper>
      
      {/* Skills */}
      {agentCard.skills && agentCard.skills.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            <LabelIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
            Skills
          </Typography>
          
          {agentCard.skills.map((skill, index) => (
            <Box key={skill.id || index} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2">
                  {skill.name || `Skill ${index + 1}`}
                </Typography>
                <JsonViewer data={skill} buttonLabel="Raw" buttonSize="small" buttonVariant="text" buttonColor="primary" />
              </Box>
              
              {skill.description && (
                <Typography variant="body2" paragraph>
                  {skill.description}
                </Typography>
              )}
              
              {skill.tags && skill.tags.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                  {skill.tags.map((tag, tagIndex) => (
                    <Chip key={tagIndex} size="small" label={tag} variant="outlined" />
                  ))}
                </Box>
              )}
              
              {skill.examples && skill.examples.length > 0 && (
                <>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                    Examples:
                  </Typography>
                  <List dense disablePadding>
                    {skill.examples.map((example, exIndex) => (
                      <ListItem key={exIndex} sx={{ pl: 1 }}>
                        <ListItemText primary={`• ${example}`} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
              
              {index < agentCard.skills.length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
}

export default AgentCardDetails; 