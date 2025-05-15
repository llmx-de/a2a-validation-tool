import { v4 as uuidv4 } from 'uuid';

/**
 * A2A Client service for communicating with AI agents
 */
class A2AClient {
  constructor(agentUrl) {
    this.agentUrl = agentUrl;
    this.headers = {
      'Content-Type': 'application/json'
    };
  }

  /**
   * Log messages with a common format
   * @param {string} type - Log type (info, warn, error)
   * @param {string} message - The message to log
   * @param {any} data - Optional data to include
   */
  _log(type, message, data) {
    const logMessage = `[A2AClient] ${message}`;
    
    // Use window.appLog if available (from Electron)
    if (window.appLog) {
      window.appLog(type, logMessage, data);
    } else {
      // Fallback to console
      const dataStr = data ? ` ${JSON.stringify(data)}` : '';
      const fullMessage = `${logMessage}${dataStr}`;

      switch(type) {
        case 'error':
          console.error(fullMessage);
          break;
        case 'warn':
          console.warn(fullMessage);
          break;
        case 'info':
          console.info(fullMessage);
          break;
        default:
          console.log(fullMessage);
      }
    }
  }

  /**
   * Get agent card information
   * @returns {Promise<Object>} The agent card
   */
  async getAgentCard() {
    try {
      // Agent cards are typically served at /.well-known/agent.json
      const cardUrl = `${this.agentUrl}/.well-known/agent.json`;
      this._log('info', 'Fetching agent card', { url: cardUrl });
      
      const response = await fetch(cardUrl, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        const error = `Failed to get agent card: ${response.status} ${response.statusText}`;
        this._log('error', error);
        throw new Error(error);
      }

      const card = await response.json();
      this._log('info', 'Retrieved agent card', card);
      return card;
    } catch (error) {
      this._log('error', 'Error getting agent card', error.message);
      throw error;
    }
  }

  /**
   * Create a JSON-RPC formatted request
   * @param {string} method - The JSON-RPC method to call
   * @param {Object} params - The parameters for the method
   * @returns {Object} - The formatted JSON-RPC request
   */
  _createJsonRpcRequest(method, params) {
    const requestId = uuidv4();
    const request = {
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: requestId
    };
    
    this._log('info', `Created JSON-RPC request for ${method}`, { id: requestId });
    return request;
  }

  /**
   * Send a task to the agent
   * @param {string} message The message text
   * @param {Object|null} file Optional file attachment
   * @param {string} sessionId Session ID for continuing conversations
   * @param {string} providedTaskId Optional specific task ID to use
   * @returns {Promise<Object>} The task result
   */
  async sendTask(message, file = null, sessionId = null, providedTaskId = null) {
    // Use provided task ID or generate one
    const taskId = providedTaskId || uuidv4();
    const actualSessionId = sessionId || uuidv4();
    
    this._log('info', 'Preparing to send task', { 
      taskId,
      sessionId: actualSessionId,
      message: message && message.length > 100 ? message.substring(0, 100) + '...' : message,
      hasFile: !!file
    });
    
    // Create message payload
    const messageParts = [
      {
        type: 'text',
        text: message
      }
    ];
    
    // Add file if provided
    if (file) {
      messageParts.push({
        type: 'file',
        file: {
          name: file.name,
          bytes: file.content // Base64 encoded file content
        }
      });
      this._log('info', 'Added file to task', { fileName: file.name });
    }
    
    // Create the params object
    const params = {
      id: taskId,
      sessionId: actualSessionId,
      acceptedOutputModes: ['text'],
      message: {
        role: 'user',
        parts: messageParts
      }
    };
    
    // Create the JSON-RPC request
    const jsonRpcRequest = this._createJsonRpcRequest('tasks/send', params);
    
    try {
      this._log('info', 'Sending task request to agent', { 
        url: this.agentUrl,
        method: jsonRpcRequest.method
      });
      
      const response = await fetch(this.agentUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(jsonRpcRequest)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        this._log('error', 'Error response from agent', { 
          status: response.status,
          statusText: response.statusText,
          response: errorText
        });
        throw new Error(`Failed to send task: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      this._log('info', 'Received task response', { 
        result: result,
        taskId
      });
      
      return {
        taskId,
        sessionId: actualSessionId,
        jsonRpcRequest,
        ...result
      };
    } catch (error) {
      this._log('error', 'Error sending task', error.message);
      throw error;
    }
  }
  
  /**
   * Send a task using streaming for real-time updates
   * @param {string} message The message text
   * @param {Object|null} file Optional file attachment
   * @param {string} sessionId Session ID for continuing conversations
   * @param {string} providedTaskId Optional specific task ID to use
   * @param {Function} onChunk Callback for each chunk received
   * @returns {Promise<Object>} The final task result
   */
  async sendTaskStreaming(message, file = null, sessionId = null, providedTaskId = null, onChunk) {
    // Use provided task ID or generate one
    const taskId = providedTaskId || uuidv4();
    const actualSessionId = sessionId || uuidv4();
    
    this._log('info', 'Preparing to send streaming task', { 
      taskId,
      sessionId: actualSessionId,
      message: message && message.length > 100 ? message.substring(0, 100) + '...' : message,
      hasFile: !!file
    });
    
    // Create message payload
    const messageParts = [
      {
        type: 'text',
        text: message
      }
    ];
    
    // Add file if provided
    if (file) {
      messageParts.push({
        type: 'file',
        file: {
          name: file.name,
          bytes: file.content // Base64 encoded file content
        }
      });
      this._log('info', 'Added file to streaming task', { fileName: file.name });
    }
    
    // Create the params object
    const params = {
      id: taskId,
      sessionId: actualSessionId,
      acceptedOutputModes: ['text'],
      message: {
        role: 'user',
        parts: messageParts
      }
    };
    
    // Create the JSON-RPC request
    const jsonRpcRequest = this._createJsonRpcRequest('send_task_streaming', params);

    try {
      // Log the actual JSON-RPC payload being sent
      this._log('info', 'Streaming JSON-RPC payload', jsonRpcRequest);
      this._log('info', 'Sending streaming task request to agent', { 
        url: this.agentUrl,
        method: jsonRpcRequest.method
      });
      
      // Try regular POST request first since some implementations might not support SSE properly
      const response = await fetch(this.agentUrl, {
        method: 'POST',
        headers: {
          ...this.headers,
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify(jsonRpcRequest)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        this._log('error', 'Error response from agent for streaming task', { 
          status: response.status,
          statusText: response.statusText,
          response: errorText
        });
        throw new Error(`Failed to send streaming task: ${response.status} ${response.statusText}`);
      }
      
      // Check content type to determine if it's streaming or regular JSON
      const contentType = response.headers.get('content-type');
      this._log('info', 'Response content type', contentType);
      
      // If it's a regular JSON response (not streaming)
      if (contentType && contentType.includes('application/json')) {
        try {
          const jsonResponse = await response.json();
          this._log('info', 'Non-streaming response received (JSON)', jsonResponse);
          
          if (onChunk) {
            onChunk(jsonResponse);
          }
          
          return {
            ...jsonResponse,
            jsonRpcRequest
          };
        } catch (error) {
          this._log('error', 'Error parsing JSON response', error.message);
          throw error;
        }
      }
      
      // Process the streaming response
      this._log('info', 'Processing streaming response');
      const reader = response.body.getReader();
      let accumulatedText = '';
      let chunkCount = 0;
      let lastCompleteResponse = null;
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          this._log('info', 'Stream completed', { totalChunks: chunkCount });
          break;
        }
        
        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value);
        accumulatedText += chunk;
        
        // Try to parse complete JSON objects from accumulated text
        try {
          // First, try to parse entire accumulated text as a single JSON object
          const jsonResponse = JSON.parse(accumulatedText);
          this._log('info', 'Parsed complete JSON response', { chunkNumber: ++chunkCount });
          lastCompleteResponse = jsonResponse;
          
          if (onChunk) {
            onChunk(jsonResponse);
          }
          
          // Reset accumulated text after successful parse
          accumulatedText = '';
          continue;
        } catch (e) {
          // Not a complete JSON object, continue with line-by-line parsing
        }
        
        // Split by newlines to get complete JSON objects
        const lines = accumulatedText.split('\n');
        accumulatedText = lines.pop() || ''; // Keep the last incomplete line
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          
          this._log('info', 'Processing stream line', { 
            line: line.length > 100 ? line.substring(0, 100) + '...' : line,
            length: line.length
          });
          
          // Handle SSE format (data: {...})
          if (line.startsWith('data:')) {
            const jsonStr = line.substring(5).trim();
            try {
              const eventData = JSON.parse(jsonStr);
              this._log('info', 'Parsed event data from stream', { chunkNumber: ++chunkCount });
              lastCompleteResponse = eventData;
              
              if (onChunk) {
                onChunk(eventData);
              }
            } catch (e) {
              this._log('error', 'Error parsing streaming response chunk', { 
                error: e.message,
                data: jsonStr.length > 100 ? jsonStr.substring(0, 100) + '...' : jsonStr
              });
            }
          } else {
            // Try parsing line as plain JSON
            try {
              const eventData = JSON.parse(line);
              this._log('info', 'Parsed plain JSON from stream', { chunkNumber: ++chunkCount });
              lastCompleteResponse = eventData;
              
              if (onChunk) {
                onChunk(eventData);
              }
            } catch (e) {
              this._log('error', 'Error parsing streaming plain JSON chunk', { 
                error: e.message,
                data: line.length > 100 ? line.substring(0, 100) + '...' : line
              });
            }
          }
        }
      }
      
      // If we got a complete response, return it instead of making another API call
      if (lastCompleteResponse) {
        this._log('info', 'Returning last complete response from stream', { taskId });
        return {
          ...lastCompleteResponse,
          jsonRpcRequest
        };
      }
      
      // Get final task state if we didn't get a complete response
      this._log('info', 'Fetching final task state after streaming', { taskId });
      const finalResponse = await this.getTask(taskId);
      return {
        ...finalResponse,
        jsonRpcRequest
      };
    } catch (error) {
      this._log('error', 'Error in streaming task', error.message);
      throw error;
    }
  }
  
  /**
   * Get a task's current state
   * @param {string} taskId The task ID
   * @returns {Promise<Object>} The task state
   */
  async getTask(taskId) {
    this._log('info', 'Getting task state', { taskId });
    
    // Create the params object
    const params = {
      id: taskId
    };
    
    // Create the JSON-RPC request
    const jsonRpcRequest = this._createJsonRpcRequest('get_task', params);
    
    try {
      const response = await fetch(this.agentUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(jsonRpcRequest)
      });
      
      if (!response.ok) {
        const error = `Failed to get task: ${response.status} ${response.statusText}`;
        this._log('error', error);
        throw new Error(error);
      }
      
      const result = await response.json();
      this._log('info', 'Retrieved task state', { taskId, result });
      return result;
    } catch (error) {
      this._log('error', 'Error getting task', error.message);
      throw error;
    }
  }
}

export default A2AClient; 