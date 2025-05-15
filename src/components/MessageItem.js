import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpIcon from '@mui/icons-material/Help';
import DataObjectIcon from '@mui/icons-material/DataObject';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import JsonViewer from './JsonViewer';

function MessageItem({ message }) {
  const isUser = message.sender === 'user';
  const isLoading = message.isLoading;
  const isError = message.error;
  const hasArtifacts = !isUser && message.artifacts && message.artifacts.length > 0;
  
  // State to track expanded artifacts
  const [expandedArtifacts, setExpandedArtifacts] = useState(new Set());
  
  // Toggle artifact expansion
  const toggleArtifact = (index) => {
    setExpandedArtifacts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };
  
  // Format timestamp
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Get state display info
  const getStateInfo = () => {
    if (isUser) return null;
    
    if (message.state === 'completed') {
      return {
        icon: <CheckCircleIcon fontSize="small" />,
        label: 'Completed',
        color: 'success'
      };
    } else if (message.state === 'input-required') {
      return {
        icon: <HelpIcon fontSize="small" />,
        label: 'Waiting for input',
        color: 'info'
      };
    }
    
    return null;
  };
  
  const stateInfo = getStateInfo();
  
  // Make sure we display the actual JSON-RPC request for user messages
  const rawResponseData = message.rawResponse || message;
  
  // Check if this is a user message with a real JSON-RPC request
  const hasJsonRpcRequest = isUser && 
    message.rawResponse && 
    message.rawResponse.jsonrpc === '2.0' && 
    message.rawResponse.method && 
    message.rawResponse.params;

  // Render an artifact
  const renderArtifact = (artifact, index) => {
    let artifactContent = 'Unknown artifact format';
    const isExpanded = expandedArtifacts.has(index);
    
    // Extract text content from artifact parts
    if (artifact.parts && artifact.parts.length > 0) {
      for (const part of artifact.parts) {
        if (part.type === 'text' && part.text) {
          artifactContent = part.text;
          break;
        }
      }
    }
    
    return (
      <Box key={index} sx={{ mt: 2 }}>
        <Divider sx={{ my: 1 }} />
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: isExpanded ? 1 : 0,
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'rgba(255, 193, 7, 0.05)',
              borderRadius: 1
            },
            p: 0.5
          }}
          onClick={() => toggleArtifact(index)}
        >
          <AutoAwesomeIcon fontSize="small" sx={{ mr: 1, color: '#7a8cb3' }} />
          <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
            Artifact {index + 1} {artifact.name ? `- ${artifact.name}` : ''}
          </Typography>
          {artifact.description && (
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              {artifact.description}
            </Typography>
          )}
          <IconButton 
            size="small" 
            onClick={(e) => { 
              e.stopPropagation(); 
              toggleArtifact(index); 
            }}
            sx={{ color: '#7a8cb3' }}
          >
            {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Box>
        {isExpanded && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              bgcolor: 'rgba(122, 140, 179, 0.1)',
              borderRadius: 2,
              borderColor: '#3f4d6a'
            }}
          >
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {artifactContent}
            </Typography>
          </Paper>
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      <Box sx={{ maxWidth: '70%' }}>
        <Box sx={{ display: 'flex', mb: 0.5, alignItems: 'center', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
          <Chip
            icon={isUser ? <PersonIcon /> : isError ? <ErrorIcon /> : <SmartToyIcon />}
            label={isUser ? 'You' : 'Agent'}
            size="small"
            color={isUser ? 'primary' : isError ? 'error' : 'default'}
            sx={{ mr: isUser ? 0 : 1, ml: isUser ? 1 : 0 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mx: 1 }}>
            {formattedTime}
          </Typography>
          
          {stateInfo && (
            <Chip
              icon={stateInfo.icon}
              label={stateInfo.label}
              size="small"
              color={stateInfo.color}
              variant="outlined"
            />
          )}
          
          {hasArtifacts && (
            <Chip
              icon={<AutoAwesomeIcon fontSize="small" />}
              label={`${message.artifacts.length} Artifact${message.artifacts.length !== 1 ? 's' : ''}`}
              size="small"
              color="warning"
              variant="outlined"
              sx={{ ml: 1 }}
            />
          )}
          
          <Box sx={{ ml: 1 }}>
            <JsonViewer 
              data={rawResponseData} 
              buttonLabel={hasJsonRpcRequest ? "RPC" : "Raw"} 
              buttonSize="small" 
              buttonVariant="text" 
              buttonColor={hasJsonRpcRequest ? "success" : "primary"}
              buttonIcon={<DataObjectIcon fontSize="small" />}
            />
          </Box>
        </Box>
        
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            bgcolor: isUser ? '#3f4d6a' : isError ? 'error.dark' : '#1f2a45',
            borderRadius: 2
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              <Typography variant="body1">
                {message.content}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {message.content}
            </Typography>
          )}
          
          {message.file && (
            <Box 
              sx={{ 
                mt: 1, 
                p: 1, 
                bgcolor: '#0d162e', 
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center' 
              }}
            >
              <AttachFileIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2" noWrap>
                {message.file.name}
              </Typography>
            </Box>
          )}
        </Paper>
        
        {/* Render artifacts if present */}
        {hasArtifacts && message.artifacts.map((artifact, index) => renderArtifact(artifact, index))}
      </Box>
    </Box>
  );
}

export default MessageItem;