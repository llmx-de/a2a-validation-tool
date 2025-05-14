import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import RefreshIcon from '@mui/icons-material/Refresh';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import MessageItem from './MessageItem';
const { ipcRenderer } = window.require('electron');

function ChatWindow({ agent, messages, onSendMessage, sessionId, onResetConversation }) {
  const [inputMessage, setInputMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionJustReset, setSessionJustReset] = useState(false);
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Detect if any message is in loading state
  useEffect(() => {
    const hasLoadingMessage = messages.some(msg => msg.isLoading);
    setIsLoading(hasLoadingMessage);
  }, [messages]);

  // Show session reset indicator for 3 seconds
  useEffect(() => {
    if (sessionJustReset) {
      const timer = setTimeout(() => {
        setSessionJustReset(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sessionJustReset]);

  const handleSendMessage = () => {
    if ((!inputMessage.trim() && !attachedFile) || isLoading) return;
    
    onSendMessage(inputMessage, attachedFile);
    setInputMessage('');
    setAttachedFile(null);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = async () => {
    try {
      const fileData = await ipcRenderer.invoke('select-file');
      if (fileData) {
        setAttachedFile(fileData);
      }
    } catch (error) {
      console.error('Error selecting file:', error);
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
  };

  const handleResetConversation = () => {
    onResetConversation();
    setSessionJustReset(true);
  };

  if (!agent) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.03)'
        }}
      >
        <Typography variant="h5" color="text.secondary">
          Select an agent to start chatting
        </Typography>
      </Box>
    );
  }

  // Calculate the height of the input area including the file preview if present
  const inputAreaHeight = attachedFile ? 140 : 90;

  return (
    <Box sx={{ 
      position: 'relative', 
      height: '100%', 
      overflow: 'hidden'
    }}>
      {/* Header - Fixed at the top */}
      <Box sx={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        padding: 2,
        backgroundColor: 'background.paper',
        zIndex: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box>
          <Typography variant="h6">{agent?.name}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              {agent?.url} {agent?.streaming ? '(Streaming enabled)' : ''}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={sessionJustReset ? "Session ID reset!" : "Session ID"}>
                <Chip 
                  label={`Session: ${sessionId ? sessionId.substring(0, 8) : 'none'}`} 
                  size="small" 
                  color={sessionJustReset ? "success" : "default"}
                  sx={{ 
                    transition: 'background-color 0.3s, color 0.3s',
                    animation: sessionJustReset ? 'pulse 1.5s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': { opacity: 0.7 },
                      '50%': { opacity: 1 },
                      '100%': { opacity: 0.7 },
                    }
                  }}
                />
              </Tooltip>
              {messages.length > 0 && messages[messages.length - 1].id && (
                <Tooltip title="Last Task ID">
                  <Chip 
                    label={`Task: ${messages[messages.length - 1].id.substring(0, 8)}`} 
                    size="small"
                    color={sessionJustReset ? "success" : 
                          (messages.length > 0 && 
                           messages[messages.length - 1].sender === 'agent' && 
                           messages[messages.length - 1].state === 'input-required') ? "primary" : "default"}
                    sx={{
                      opacity: 0.7,
                      transition: 'background-color 0.3s, color 0.3s'
                    }}
                  />
                </Tooltip>
              )}
            </Box>
          </Box>
        </Box>
        <Box>
          <Tooltip title="Reset conversation">
            <IconButton 
              onClick={handleResetConversation}
              disabled={isLoading}
              color="primary"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Messages - Scrollable area with fixed positioning */}
      <Box 
        ref={messageContainerRef}
        sx={{ 
          position: 'absolute',
          top: '70px', // Header height
          bottom: `${inputAreaHeight}px`, // Space for input
          left: 0,
          right: 0,
          overflowY: 'auto',
          padding: 2,
          zIndex: 1,
          backgroundColor: 'background.default',
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              Start a conversation with {agent?.name}
            </Typography>
          </Box>
        ) : (
          <Box>
            {messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>
      
      {/* Input area - Fixed at the bottom */}
      <Box sx={{ 
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        padding: 2,
        backgroundColor: 'background.paper',
        zIndex: 2
      }}>
        {/* Attached File Preview */}
        {attachedFile && (
          <Paper 
            variant="outlined" 
            sx={{ 
              mb: 1, 
              p: 1
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" noWrap sx={{ maxWidth: '80%' }}>
                {attachedFile.name}
              </Typography>
              <Button size="small" onClick={handleRemoveFile}>
                Remove
              </Button>
            </Box>
          </Paper>
        )}
        
        {/* Input field */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
          <IconButton 
            color="primary" 
            sx={{ mr: 1 }}
            onClick={handleFileSelect}
            disabled={isLoading}
          >
            <AttachFileIcon />
          </IconButton>
          
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder={isLoading ? "Waiting for response..." : "Type a message..."}
            variant="outlined"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          
          <IconButton 
            color="primary" 
            sx={{ ml: 1 }}
            onClick={handleSendMessage}
            disabled={(!inputMessage.trim() && !attachedFile) || isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

export default ChatWindow; 