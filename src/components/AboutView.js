import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import LanguageIcon from '@mui/icons-material/Language';
import GitHubIcon from '@mui/icons-material/GitHub';
import Button from '@mui/material/Button';

function AboutView() {
  // Define UTM parameters for tracking
  const utmParams = 'utm_source=a2a-validation-tool&utm_medium=app&utm_campaign=about';
  const githubUrl = `https://github.com/llmx-de/a2a-validation-tool?${utmParams}`;
  const llmxUrl = `https://llmx.de/?${utmParams}`;

  return (
    <Box sx={{ 
      p: 3, 
      height: '100%',
      width: '100%',
      position: 'absolute',
      overflow: 'auto'
    }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        mb: 4
      }}>
        <SmartToyIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          A2A Validation Tool
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          Version 1.0.0
        </Typography>
        <Typography variant="body1" align="center" sx={{ maxWidth: 600 }}>
          A desktop application for testing and validating Agent-to-Agent (A2A) protocol implementations.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button 
            variant="outlined" 
            startIcon={<GitHubIcon />}
            component={Link}
            href={githubUrl}
            target="_blank"
            rel="noopener"
          >
            GitHub Repository
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<LanguageIcon />}
            component={Link}
            href={llmxUrl}
            target="_blank"
            rel="noopener"
          >
            Developer Website
          </Button>
        </Box>
      </Box>
      
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          About this Tool
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body1" paragraph>
          The A2A Validation Tool helps developers test their agent implementations against the A2A protocol specifications. 
          It provides a simple interface to interact with agents, view their capabilities, and validate their responses.
        </Typography>
        <Typography variant="body1">
          Key features include:
        </Typography>
        <ul>
          <li>
            <Typography variant="body1">Send messages to agents and receive responses</Typography>
          </li>
          <li>
            <Typography variant="body1">View agent cards and capabilities</Typography>
          </li>
          <li>
            <Typography variant="body1">Support for streaming responses</Typography>
          </li>
          <li>
            <Typography variant="body1">Manage multiple agent configurations</Typography>
          </li>
          <li>
            <Typography variant="body1">View raw request and response data</Typography>
          </li>
          <li>
            <Typography variant="body1">Display agent artifacts</Typography>
          </li>
        </ul>
      </Paper>
      
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          A2A Protocol
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body1" paragraph>
          The Agent-to-Agent (A2A) protocol is a standardized way for AI agents to communicate with each other.
          It defines the format for request and response messages, allowing for interoperability between different agent implementations.
        </Typography>
        <Typography variant="body1">
          Learn more about the A2A Protocol at the <Link href="https://google.github.io/A2A/" target="_blank" rel="noopener">A2A Protocol Documentation</Link>.
        </Typography>
      </Paper>
      
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          About the Developer
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body1" paragraph>
          This tool was developed by <strong>LLMx</strong>, an End-to-End AI & A2A Integration group specializing in Agent-to-Agent communications
          and multi-agent orchestration. Founded by Dmytro, LLMx focuses on making AI models talk, share context, and stay observable in production.
        </Typography>
        <Typography variant="body1" paragraph>
          The A2A Validation Tool is part of LLMx's broader effort to standardize and promote adoption of the Agent-to-Agent protocol.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Link href={githubUrl} target="_blank" rel="noopener">
            View on GitHub
          </Link>
          <Link href={llmxUrl} target="_blank" rel="noopener">
            Visit LLMx Website
          </Link>
        </Box>
      </Paper>
    </Box>
  );
}

export default AboutView; 