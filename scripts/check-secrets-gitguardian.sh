#!/bin/bash

# GitGuardian Secret Scanning for Pre-Commit Hook
# Uses GitGuardian CLI (ggshield) for local secret detection

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Scanning for secrets with GitGuardian..."

# Check if ggshield is installed
if ! command -v ggshield &> /dev/null; then
    echo -e "${YELLOW}⚠️  GitGuardian CLI (ggshield) not installed${NC}"
    echo -e "${YELLOW}Installing ggshield...${NC}"

    # Try pipx first (recommended for macOS/brew-managed Python)
    if command -v pipx &> /dev/null; then
        pipx install ggshield --quiet 2>/dev/null
    # Fall back to pip with --user and --break-system-packages
    elif command -v pip3 &> /dev/null; then
        pip3 install --user --break-system-packages ggshield --quiet 2>/dev/null
    elif command -v pip &> /dev/null; then
        pip install --user --break-system-packages ggshield --quiet 2>/dev/null
    else
        echo -e "${RED}❌ Cannot install ggshield: neither pipx nor pip found${NC}"
        echo -e "${YELLOW}Install manually:${NC}"
        echo -e "${YELLOW}  brew install pipx && pipx install ggshield${NC}"
        echo -e "${YELLOW}  OR${NC}"
        echo -e "${YELLOW}  pip3 install --user ggshield${NC}"
        exit 1
    fi

    # Update PATH if ggshield was installed to ~/.local/bin
    if [ -d "$HOME/.local/bin" ]; then
        export PATH="$HOME/.local/bin:$PATH"
    fi

    # Check if installation succeeded
    if ! command -v ggshield &> /dev/null; then
        echo -e "${RED}❌ ggshield installation failed${NC}"
        echo -e "${YELLOW}Install manually with: brew install pipx && pipx install ggshield${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ ggshield installed successfully${NC}"
fi

# Run GitGuardian scan on staged files
# --exit-zero: Don't fail the commit, just warn
# --show-secrets: Show the actual secrets found (for debugging)
# --exclude: Exclude common false positive patterns

if ggshield secret scan pre-commit; then
    echo -e "${GREEN}✅ No secrets detected by GitGuardian!${NC}"
    exit 0
else
    echo -e "${RED}❌ GitGuardian detected potential secrets!${NC}"
    echo -e "${YELLOW}⚠️  Please review the findings above and remove any secrets.${NC}"
    echo -e "${YELLOW}Tip: Use environment variables instead of hardcoding secrets.${NC}"
    exit 1
fi
