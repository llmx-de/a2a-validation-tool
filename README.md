# A2A Validation Tool

![llmx_a2a_validation_tool_example](https://github.com/user-attachments/assets/86d8c9f2-3353-45e9-adc2-4b96114712d5)


A desktop application for testing and validating Agent-to-Agent (A2A) protocol implementations. This tool provides a user-friendly interface to interact with A2A agents, manage conversation sessions, and validate protocol compliance.

## Features

- Connect to multiple A2A agents simultaneously
- Display and inspect agent card information including capabilities
- Support for streaming and non-streaming agents
- Session management with auto-detection of input-required states
- File attachment support
- JSON visualization for debugging requests and responses
- Export and import agent configurations
- Persistent storage of agent configurations
- Cross-platform support (macOS, Windows, Linux)

## Development Setup

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

Go to the [releases page](https://github.com/llmx-de/a2a-validation-tool/releases/latest) and download the latest version for your platform.

#### MacOS
Download the .dmg file and double click on it to install the application.

#### Windows

Download the .exe file and run it to install the application.

#### Linux

You can install it with one command (recommended):

```bash
curl -s https://raw.githubusercontent.com/llmx-de/a2a-validation-tool/main/scripts/install.sh | bash
```

This will automatically download the latest version, make it executable, and create a desktop entry
.

The same command can also be used to upgrade an existing installation to the latest version.

Alternatively, you can download the .AppImage file and make it executable by running `chmod +x a2a-validation-tool.AppImage` and then run it.



#### Manual

1. Clone the repository:
   ```bash
   git clone https://github.com/dmi3coder/a2a-validation-tool.git
   cd a2a-validation-tool
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
This will launch the application in development mode with hot reloading enabled.

## Building for Production

### macOS

```bash
npm run pack-mac
```

This will create distributable files in the `dist` directory:
- `.dmg` installer
- `.app` zipped application

### Windows

```bash
npm run pack-win
```

This will create an NSIS installer in the `dist` directory.

### Linux

```bash
npm run pack-linux
```

This will create:
- AppImage
- Debian package

## Using the Application

### Managing Agents

1. **Adding an Agent**:
   - Click the menu button in the Agents panel header
   - Select "Add Agent"
   - Enter the agent URL (e.g., `http://localhost:10000`)
   - The application will validate the agent and retrieve its capabilities

2. **Importing/Exporting Agents**:
   - Use the menu options to import from a file or text
   - Export your agent configurations to share with others

### Chatting with Agents

1. Select an agent from the left panel
2. Enter a message in the text field
3. Optionally attach a file using the paperclip icon
4. Send your message using the send button

### Viewing Agent Information

Click the "Agent Card" tab to view detailed information about the agent's capabilities and metadata.

### Debugging

1. Click the "Raw" button on any message to view the complete API request or response
2. The debug log panel at the bottom shows detailed logs of all API interactions

## License

GPL


