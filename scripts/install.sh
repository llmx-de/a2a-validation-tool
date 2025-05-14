#!/bin/bash

# A2A Validation Tool Installation Script for Linux
echo "A2A Validation Tool Installer"

# Create application directory if it doesn't exist
APP_DIR="$HOME/.local/bin"
DESKTOP_DIR="$HOME/.local/share/applications"
APP_NAME="a2a-validation-tool"
APP_PATH="$APP_DIR/$APP_NAME"

mkdir -p "$APP_DIR"
mkdir -p "$DESKTOP_DIR"

# Check if the application is already installed
if [ -f "$APP_PATH" ]; then
    echo "Found existing installation. Upgrading A2A Validation Tool..."
    UPGRADING=true
else
    echo "Installing A2A Validation Tool..."
    UPGRADING=false
fi

# Get the latest release URL
GITHUB_REPO="llmx-de/a2a-validation-tool"
API_URL="https://api.github.com/repos/$GITHUB_REPO/releases/latest"

echo "Fetching latest release information..."
RELEASE_DATA=$(curl -s "$API_URL")
DOWNLOAD_URL=$(echo "$RELEASE_DATA" | grep -o "https://github.com/$GITHUB_REPO/releases/download/[^\"]*\.AppImage" | head -1)
VERSION=$(echo "$RELEASE_DATA" | grep -o '"tag_name": "[^"]*"' | cut -d'"' -f4)

if [ -z "$DOWNLOAD_URL" ]; then
    echo "Error: Could not find AppImage download URL. Please check if the repository has releases."
    exit 1
fi

if [ "$UPGRADING" = true ]; then
    # Check current version if possible
    if [ -x "$APP_PATH" ]; then
        echo "Backing up existing application..."
        mv "$APP_PATH" "${APP_PATH}.backup"
    else
        echo "Removing existing application..."
        rm -f "$APP_PATH"
    fi
fi

echo "Downloading $APP_NAME ${VERSION} from $DOWNLOAD_URL..."
curl -L "$DOWNLOAD_URL" -o "$APP_PATH"

if [ $? -ne 0 ]; then
    echo "Error: Download failed. Please check your internet connection and try again."
    if [ "$UPGRADING" = true ] && [ -f "${APP_PATH}.backup" ]; then
        echo "Restoring backup..."
        mv "${APP_PATH}.backup" "$APP_PATH"
    fi
    exit 1
fi

echo "Making the application executable..."
chmod +x "$APP_PATH"

# Clean up backup if upgrade was successful
if [ "$UPGRADING" = true ] && [ -f "${APP_PATH}.backup" ]; then
    echo "Removing backup..."
    rm -f "${APP_PATH}.backup"
fi

# Create desktop entry
echo "Creating desktop entry..."
cat > "$DESKTOP_DIR/$APP_NAME.desktop" << EOF
[Desktop Entry]
Name=A2A Validation Tool
Exec=$APP_PATH
Icon=utilities-terminal
Type=Application
Categories=Development;
EOF

if [ "$UPGRADING" = true ]; then
    echo "Upgrade completed successfully!"
else
    echo "Installation completed successfully!"
fi

echo "You can now launch A2A Validation Tool by running '$APP_PATH' or from your application menu." 