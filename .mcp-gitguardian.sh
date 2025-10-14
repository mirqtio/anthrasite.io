#!/bin/bash
export GITGUARDIAN_URL="https://dashboard.gitguardian.com"
export GITGUARDIAN_CLIENT_ID="ggshield_oauth"
exec /opt/homebrew/bin/uvx --from "git+https://github.com/GitGuardian/gg-mcp.git" developer-mcp-server
