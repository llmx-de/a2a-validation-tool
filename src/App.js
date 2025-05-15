import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { v4 as uuidv4 } from 'uuid';
import AgentList from './components/AgentList';
import ChatWindow from './components/ChatWindow';
import AgentCardDetails from './components/AgentCardDetails';
import LogViewer from './components/LogViewer';
import AboutView from './components/AboutView';
import SettingsView from './components/SettingsView';
import { loadAgents, saveAgents } from './services/agentStorage';
import { loadSettings, saveSettings } from './services/settingsStorage';
import A2AClient from './services/a2aClient';

// LLMx brand colors
const llmxTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7a8cb3', // LLMx blue-gray
      light: '#a6b3cf',
      dark: '#526699',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3f4d6a', // LLMx mid-tone blue
      light: '#5a6885',
      dark: '#2a3651',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0d162e', // LLMx darkest blue
      paper: '#1f2a45', // LLMx dark blue
    },
    text: {
      primary: '#ffffff',
      secondary: '#d0d8e8',
    },
    divider: '#3f4d6a',
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    success: {
      main: '#4caf50',
    },
    info: {
      main: '#7a8cb3',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1f2a45',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1f2a45',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

function App() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentCard, setAgentCard] = useState(null);
  const [isLoadingCard, setIsLoadingCard] = useState(false);
  const [chats, setChats] = useState({});
  const [sessions, setSessions] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [currentView, setCurrentView] = useState('main'); // 'main', 'about', or 'settings'
  const [logEnabled, setLogEnabled] = useState(true); // State for log visibility
  const [settings, setSettings] = useState({}); // State to store all settings
  const clientsRef = useRef({});

  // Create a log function
  const log = (type, message, data) => {
    if (!logEnabled) return; // Skip logging if disabled
    
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [
      ...prevLogs,
      { type, message, data, timestamp }
    ]);
    
    // If window.appLog is defined (from Electron), use it
    if (window.appLog) {
      window.appLog(type, message, data);
    } else {
      // Fallback to regular console
      switch(type) {
        case 'error':
          console.error(message, data || '');
          break;
        case 'warn':
          console.warn(message, data || '');
          break;
        case 'info':
          console.info(message, data || '');
          break;
        default:
          console.log(message, data || '');
      }
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  // Load settings from storage
  useEffect(() => {
    try {
      const savedSettings = loadSettings();
      setSettings(savedSettings);
      setLogEnabled(savedSettings.logEnabled);
      log('info', 'Loaded settings', savedSettings);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }, []);

  // Update stored settings when logEnabled changes
  useEffect(() => {
    // Don't save on initial load
    if (Object.keys(settings).length === 0) return;
    
    const updatedSettings = { ...settings, logEnabled };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
    log('info', 'Saved settings', updatedSettings);
  }, [logEnabled]);

  useEffect(() => {
    // Load saved agents on startup
    try {
      const savedAgents = loadAgents();
      log('info', 'Loaded saved agents', savedAgents);
      
      if (savedAgents && savedAgents.length > 0) {
        setAgents(savedAgents);
      } else {
        // Add a default agent example
        const defaultAgent = {
          id: '1',
          name: 'Local Agent',
          url: 'http://localhost:10000',
          streaming: true
        };
        setAgents([defaultAgent]);
        saveAgents([defaultAgent]);
        log('info', 'Created default agent', defaultAgent);
      }
    } catch (err) {
      log('error', 'Failed to load agents', err.message);
      setError('Failed to load agents: ' + err.message);
    }
  }, []);

  // Initialize or update clients when agents change
  useEffect(() => {
    agents.forEach(agent => {
      if (!clientsRef.current[agent.id]) {
        clientsRef.current[agent.id] = new A2AClient(agent.url);
        log('info', `Created client for agent: ${agent.name}`, { url: agent.url });
      } else if (clientsRef.current[agent.id].agentUrl !== agent.url) {
        // Update client if URL changed
        clientsRef.current[agent.id] = new A2AClient(agent.url);
        log('info', `Updated client for agent: ${agent.name}`, { url: agent.url });
      }
    });
  }, [agents]);

  const handleAddAgent = (newAgent) => {
    // Handle both single agent and array of agents
    if (Array.isArray(newAgent)) {
      setAgents(newAgent);
      saveAgents(newAgent);
      log('info', 'Updated agents list', newAgent);
      return;
    }
    
    const updatedAgents = [...agents, newAgent];
    setAgents(updatedAgents);
    saveAgents(updatedAgents);
    
    // If the new agent already has a card, we can set it directly
    if (newAgent.card) {
      log('info', 'Agent added with card data', { 
        agent: newAgent.name, 
        capabilities: newAgent.card.capabilities
      });
    }
    
    log('info', 'Added new agent', newAgent);
  };

  const handleRemoveAgent = (agentId) => {
    const agent = agents.find(a => a.id === agentId);
    const updatedAgents = agents.filter(agent => agent.id !== agentId);
    setAgents(updatedAgents);
    saveAgents(updatedAgents);
    
    // Clean up client
    if (clientsRef.current[agentId]) {
      delete clientsRef.current[agentId];
    }
    
    if (selectedAgent && selectedAgent.id === agentId) {
      setSelectedAgent(null);
      setAgentCard(null);
    }
    
    log('info', 'Removed agent', agent);
  };

  const fetchAgentCard = async (agent) => {
    setIsLoadingCard(true);
    setAgentCard(null);
    
    try {
      const client = clientsRef.current[agent.id];
      if (!client) {
        throw new Error('Agent client not found');
      }
      
      log('info', 'Fetching agent card', { agentId: agent.id, url: agent.url });
      const card = await client.getAgentCard();
      log('info', 'Received agent card', card);
      
      setAgentCard(card);
    } catch (err) {
      log('error', 'Failed to fetch agent card', err.message);
      setError(`Failed to fetch agent card: ${err.message}`);
    } finally {
      setIsLoadingCard(false);
    }
  };

  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent);
    setCurrentView('main'); // Switch back to main view when an agent is selected
    setActiveTab(0); // Default to chat tab when selecting an agent
    log('info', 'Selected agent', agent);
    
    // Fetch agent card
    fetchAgentCard(agent);
    
    // Initialize chat history for this agent if needed
    if (!chats[agent.id]) {
      setChats(prev => ({
        ...prev,
        [agent.id]: []
      }));
    }
    
    // Initialize session ID for this agent if needed
    if (!sessions[agent.id]) {
      const newSessionId = uuidv4();
      setSessions(prev => ({
        ...prev,
        [agent.id]: newSessionId
      }));
      log('info', 'Created new session', { agentId: agent.id, sessionId: newSessionId });
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Helper function to extract content and state from response
  const extractFromResponse = (response) => {
    log('info', 'Extracting content from response', response);
    
    let content = 'No response content found';
    let state = null;
    let artifacts = null;
    
    // Check if it's a JSON-RPC response from current agents
    if (response.jsonrpc === '2.0' && response.result) {
      // Extract state if available
      if (response.result.status && response.result.status.state) {
        state = response.result.status.state;
        log('info', 'Found conversation state', state);
      }
      
      // Extract artifacts if available
      if (response.result.artifacts && Array.isArray(response.result.artifacts)) {
        artifacts = response.result.artifacts;
        log('info', 'Found artifacts', artifacts);
        
        // Try to extract content from result artifact
        for (const artifact of response.result.artifacts) {
          if (artifact.name === 'result' && artifact.parts && Array.isArray(artifact.parts)) {
            for (const part of artifact.parts) {
              if (part.type === 'text' && part.text) {
                log('info', 'Found text in artifacts.result.parts', part.text);
                content = part.text;
                break;
              }
            }
          }
        }
      }
      
      // Path for agents using status.message.parts format
      if (content === 'No response content found' && 
          response.result.status && response.result.status.message && 
          response.result.status.message.parts && response.result.status.message.parts.length > 0) {
        for (const part of response.result.status.message.parts) {
          if (part.type === 'text' && part.text) {
            log('info', 'Found text in status.message.parts', part.text);
            content = part.text;
            break;
          }
        }
      }
    }
    
    // Check if it's a JSON-RPC response in other format
    if (response.result && !content || content === 'No response content found') {
      // First check if there's a direct content field
      if (response.result.content) {
        log('info', 'Found content field in result', response.result.content);
        content = response.result.content;
      }
      
      // Check if there's a message with parts
      else if (response.result.message && response.result.message.parts) {
        for (const part of response.result.message.parts) {
          if (part.type === 'text') {
            log('info', 'Found text part in message', part.text);
            content = part.text || '';
            break;
          }
        }
      }
      
      // Check if there's a direct agent response format
      else if (response.result.agent_response) {
        log('info', 'Found agent_response field', response.result.agent_response.content);
        content = response.result.agent_response.content || 'No content in agent response';
      }
    }
    
    // Fallback to checking the entire response
    if ((!content || content === 'No response content found') && response.content) {
      log('info', 'Found content field at top level', response.content);
      content = response.content;
    }
    
    // Fallback for when response is in different format
    if ((!content || content === 'No response content found') && typeof response === 'object') {
      const contentFields = ['content', 'text', 'message'];
      for (const field of contentFields) {
        if (response[field]) {
          log('info', `Found ${field} field at top level`, response[field]);
          content = response[field];
          break;
        }
      }
    }
    
    if (content === 'No response content found') {
      log('warn', 'No content found in response', response);
    }
    
    return { content, state, artifacts };
  };

  const handleSendMessage = async (message, file) => {
    if (!selectedAgent) return;
    
    log('info', 'Sending message', { agent: selectedAgent.name, message, hasFile: !!file });
    
    // Get or create client for this agent
    const client = clientsRef.current[selectedAgent.id];
    if (!client) {
      const errorMsg = 'Agent client not found. Please try again or restart the application.';
      setError(errorMsg);
      log('error', errorMsg);
      return;
    }
    
    // Get session ID for this agent
    const sessionId = sessions[selectedAgent.id];
    log('info', 'Using session ID', sessionId);
    
    // Check if we should continue an existing task (if last message was input-required)
    let continuingTaskId = null;
    const agentMessages = chats[selectedAgent.id] || [];
    if (agentMessages.length > 0) {
      const lastMessage = agentMessages[agentMessages.length - 1];
      if (lastMessage.sender === 'agent' && lastMessage.state === 'input-required') {
        continuingTaskId = lastMessage.id;
        log('info', 'Continuing existing task', { taskId: continuingTaskId });
      }
    }
    
    // Create a request object to display in raw view
    const taskId = continuingTaskId || uuidv4();
    const requestObject = {
      jsonrpc: "2.0",
      id: uuidv4(),
      method: "sendTask",
      params: {
        id: taskId,
        sessionId: sessionId,
        message: {
          role: "user",
          parts: [
            {
              type: "text",
              text: message
            }
          ]
        }
      }
    };
    
    // Add file to request if present
    if (file) {
      requestObject.params.message.parts.push({
        type: "file",
        file: {
          name: file.name,
          mimeType: file.type
        }
      });
    }
    
    // Add user message to chat history
    const userMessageId = Date.now().toString();
    const userMessage = {
      id: userMessageId,
      sender: 'user',
      content: message,
      file: file,
      timestamp: new Date().toISOString(),
      rawResponse: requestObject // Store the request object for raw view
    };
    
    setChats(prev => ({
      ...prev,
      [selectedAgent.id]: [...(prev[selectedAgent.id] || []), userMessage]
    }));

    try {
      // Mark the chat as loading
      const loadingMessage = {
        id: `loading-${Date.now()}`,
        sender: 'agent',
        content: '...',
        isLoading: true,
        timestamp: new Date().toISOString(),
      };
      
      setChats(prev => ({
        ...prev,
        [selectedAgent.id]: [...(prev[selectedAgent.id] || []), loadingMessage]
      }));

      let response;
      let conversationState = null;
      let content = '';
      
      if (selectedAgent.streaming) {
        // For streaming responses, we'll update the message incrementally
        let streamContent = '';
        log('info', 'Sending streaming request', { taskId, sessionId });
        
        response = await client.sendTaskStreaming(
          message, 
          file, 
          sessionId,
          taskId,
          async (chunk) => {
            log('info', 'Stream chunk received', chunk);
            
            // Try to extract content and state from the chunk
            const { content: chunkContent, state: chunkState, artifacts: chunkArtifacts } = extractFromResponse(chunk);
            if (chunkContent && chunkContent !== 'No response content found' && chunkContent !== streamContent) {
              streamContent = chunkContent;
              log('info', 'Updated stream content', streamContent);
              
              if (chunkState) {
                conversationState = chunkState;
                log('info', 'Updated conversation state', conversationState);
              }
              
              // Update the message with the accumulated content
              setChats(prev => {
                const updatedMessages = [...prev[selectedAgent.id]];
                const loadingMessageIndex = updatedMessages.findIndex(msg => msg.id === loadingMessage.id);
                
                if (loadingMessageIndex !== -1) {
                  updatedMessages[loadingMessageIndex] = {
                    ...updatedMessages[loadingMessageIndex],
                    content: streamContent,
                    state: conversationState,
                    artifacts: chunkArtifacts,
                    isLoading: true,
                    rawResponse: chunk
                  };
                }
                
                return {
                  ...prev,
                  [selectedAgent.id]: updatedMessages
                };
              });
            }
          }
        );
        
        // Override the user message to show the real request payload
        setChats(prev => {
          const updated = [...prev[selectedAgent.id]];
          const idx = updated.findIndex(msg => msg.id === userMessageId);
          if (idx !== -1) {
            // Make sure we're getting the actual JSON-RPC request object
            const jsonRpcPayload = response.jsonRpcRequest || requestObject;
            updated[idx] = { ...updated[idx], rawResponse: jsonRpcPayload };
          }
          return { ...prev, [selectedAgent.id]: updated };
        });
        log('info', 'Streaming completed, final content', { content: streamContent, state: conversationState });
        content = streamContent;
        
        // Final update to remove loading status
        setChats(prev => {
          const updatedMessages = [...prev[selectedAgent.id]];
          const loadingMessageIndex = updatedMessages.findIndex(msg => msg.id === loadingMessage.id);
          
          if (loadingMessageIndex !== -1) {
            // Extract final artifacts if available
            const { artifacts: finalArtifacts } = extractFromResponse(response);
            
            const { jsonRpcRequest, ...agentPayload } = response;
            
            updatedMessages[loadingMessageIndex] = {
              id: taskId,
              sender: 'agent',
              content: streamContent || 'No response received',
              state: conversationState,
              artifacts: finalArtifacts,
              isLoading: false,
              timestamp: new Date().toISOString(),
              rawResponse: agentPayload
            };
          }
          
          return {
            ...prev,
            [selectedAgent.id]: updatedMessages
          };
        });
      } else {
        // For non-streaming responses
        log('info', 'Sending non-streaming request', { sessionId });
        response = await client.sendTask(message, file, sessionId, taskId);
        // Override the user message to show the real request payload
        setChats(prev => {
          const updated = [...prev[selectedAgent.id]];
          const idx = updated.findIndex(msg => msg.id === userMessageId);
          if (idx !== -1) {
            // Make sure we're getting the actual JSON-RPC request object
            const jsonRpcPayload = response.jsonRpcRequest || requestObject;
            updated[idx] = { ...updated[idx], rawResponse: jsonRpcPayload };
          }
          return { ...prev, [selectedAgent.id]: updated };
        });
        log('info', 'Received non-streaming response', response);
        
        // Extract content and state from the response
        const { content: extractedContent, state: extractedState, artifacts: extractedArtifacts } = extractFromResponse(response);
        content = extractedContent;
        conversationState = extractedState;
        
        log('info', 'Extracted data', { content, state: conversationState, hasArtifacts: !!extractedArtifacts });
        
        // Replace the loading message with the real response
        setChats(prev => {
          const updatedMessages = [...prev[selectedAgent.id]];
          const loadingMessageIndex = updatedMessages.findIndex(msg => msg.id === loadingMessage.id);
          
          if (loadingMessageIndex !== -1) {
            
            const { jsonRpcRequest, ...agentPayload } = response;
            updatedMessages[loadingMessageIndex] = {
              id: response.taskId || Date.now().toString(),
              sender: 'agent',
              content: content,
              state: conversationState,
              artifacts: extractedArtifacts,
              timestamp: new Date().toISOString(),
              rawResponse: agentPayload
            };
          }
          
          return {
            ...prev,
            [selectedAgent.id]: updatedMessages
          };
        });
      }
    } catch (err) {
      log('error', 'Error sending message', err);
      setError(`Failed to communicate with agent: ${err.message}`);
      
      // Remove the loading message and add an error message
      setChats(prev => {
        const updatedMessages = prev[selectedAgent.id].filter(msg => !msg.isLoading);
        updatedMessages.push({
          id: Date.now().toString(),
          sender: 'agent',
          content: `Error: ${err.message}`,
          error: true,
          timestamp: new Date().toISOString(),
        });
        
        return {
          ...prev,
          [selectedAgent.id]: updatedMessages
        };
      });
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleOpenAbout = () => {
    setCurrentView('about');
  };

  const handleOpenSettings = () => {
    setCurrentView('settings');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
  };

  const renderMainContent = () => {
    if (!selectedAgent) {
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
            Select an agent to start
          </Typography>
        </Box>
      );
    }

    // Get the current session ID for the selected agent
    const currentSessionId = sessions[selectedAgent.id];

    // Handler for resetting the conversation
    const handleResetConversation = () => {
      // Generate a new session ID
      const newSessionId = uuidv4();
      
      // Update session ID
      setSessions(prev => ({
        ...prev,
        [selectedAgent.id]: newSessionId
      }));
      
      // Clear chat history
      setChats(prev => ({
        ...prev,
        [selectedAgent.id]: []
      }));
      
      log('info', 'Conversation reset', { 
        agentId: selectedAgent.id, 
        oldSessionId: currentSessionId, 
        newSessionId 
      });
    };

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Chat" />
            <Tab label="Agent Card" />
          </Tabs>
        </Box>
        
        <Box sx={{ 
          display: activeTab === 0 ? 'block' : 'none', 
          height: 'calc(100% - 48px)', // 48px is the height of the tabs
          position: 'relative'
        }}>
          <ChatWindow
            agent={selectedAgent}
            messages={chats[selectedAgent.id] || []}
            onSendMessage={handleSendMessage}
            sessionId={currentSessionId}
            onResetConversation={handleResetConversation}
          />
        </Box>
        
        <Box sx={{ 
          display: activeTab === 1 ? 'block' : 'none', 
          height: 'calc(100% - 48px)', // 48px is the height of the tabs
          position: 'relative'
        }}>
          <AgentCardDetails agentCard={agentCard} isLoading={isLoadingCard} />
        </Box>
      </Box>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'about':
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.12)', display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>About</Typography>
              <Button color="primary" onClick={handleBackToMain}>
                Back
              </Button>
            </Box>
            <Box sx={{ flexGrow: 1, overflow: 'auto', position: 'relative' }}>
              <AboutView />
            </Box>
          </Box>
        );
      case 'settings':
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.12)', display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>Settings</Typography>
              <Button color="primary" onClick={handleBackToMain}>
                Back
              </Button>
            </Box>
            <Box sx={{ flexGrow: 1, overflow: 'auto', position: 'relative' }}>
              <SettingsView 
                logEnabled={logEnabled} 
                onLogEnabledChange={setLogEnabled} 
              />
            </Box>
          </Box>
        );
      default:
        return renderMainContent();
    }
  };

  // Listen for menu events from the main process
  useEffect(() => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      
      // Handler for Add Agent menu item
      const addAgentHandler = () => {
        const agentListComponent = document.querySelector('[data-testid="agent-list-add-button"]');
        if (agentListComponent) {
          agentListComponent.click();
        }
      };
      
      // Handler for Import Agents menu item
      const importAgentsHandler = () => {
        const fileInput = document.querySelector('input[type="file"][accept=".json"]');
        if (fileInput) {
          fileInput.click();
        }
      };
      
      // Handler for Export Agents menu item
      const exportAgentsHandler = () => {
        if (agents.length > 0) {
          try {
            const { exportAgents } = require('./services/agentStorage');
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
            
            log('info', 'Agents exported successfully', { count: agents.length });
          } catch (error) {
            log('error', 'Error exporting agents', error.message);
          }
        }
      };
      
      // Register event listeners
      ipcRenderer.on('menu-add-agent', addAgentHandler);
      ipcRenderer.on('menu-import-agents', importAgentsHandler);
      ipcRenderer.on('menu-export-agents', exportAgentsHandler);
      
      // Clean up event listeners on unmount
      return () => {
        ipcRenderer.removeListener('menu-add-agent', addAgentHandler);
        ipcRenderer.removeListener('menu-import-agents', importAgentsHandler);
        ipcRenderer.removeListener('menu-export-agents', exportAgentsHandler);
      };
    }
  }, [agents]);

  return (
    <ThemeProvider theme={llmxTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, height: '100vh', overflow: 'hidden' }}>
        <Grid container sx={{ height: '100%' }}>
          <Grid item xs={3} sx={{ borderRight: '1px solid rgba(255, 255, 255, 0.12)' }}>
            <AgentList 
              agents={agents}
              selectedAgent={selectedAgent}
              onAddAgent={handleAddAgent}
              onRemoveAgent={handleRemoveAgent}
              onSelectAgent={handleSelectAgent}
              fetchAgentCard={fetchAgentCard}
              onOpenAbout={handleOpenAbout}
              onOpenSettings={handleOpenSettings}
            />
          </Grid>
          <Grid item xs={9}>
            {renderContent()}
          </Grid>
        </Grid>
      </Box>
      
      {/* Debug Log Viewer */}
      {logEnabled && <LogViewer logs={logs} onClearLogs={clearLogs} />}
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App; 