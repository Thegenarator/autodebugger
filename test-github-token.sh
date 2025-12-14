#!/bin/bash
# Quick test script for GitHub token

echo "🔍 Testing GitHub Token..."
echo ""

cd ~/autodebugger || exit 1

# Check .env exists
if [ ! -f .env ]; then
  echo "❌ .env file not found!"
  exit 1
fi

# Extract token
TOKEN=$(grep "^GITHUB_TOKEN=" .env | cut -d'=' -f2 | tr -d ' ' | tr -d '"' | tr -d "'")

if [ -z "$TOKEN" ]; then
  echo "❌ GITHUB_TOKEN not found in .env"
  exit 1
fi

echo "✅ Token found: ${TOKEN:0:10}..."

# Test authentication
echo ""
echo "Testing authentication..."
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user)

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
  USERNAME=$(echo "$BODY" | grep -o '"login":"[^"]*' | cut -d'"' -f4)
  echo "✅ Authentication successful!"
  echo "   Authenticated as: $USERNAME"
  
  # Check scopes
  echo ""
  echo "Checking token scopes..."
  SCOPES=$(curl -s -I -H "Authorization: token $TOKEN" \
    https://api.github.com/user | grep -i "x-oauth-scopes" | cut -d' ' -f2- | tr -d '\r')
  
  if echo "$SCOPES" | grep -q "repo"; then
    echo "✅ Token has 'repo' scope - can create PRs!"
  else
    echo "⚠️  Token might not have 'repo' scope"
    echo "   Scopes: $SCOPES"
  fi
  
  # Test repository access
  OWNER=$(grep "^GITHUB_OWNER=" .env | cut -d'=' -f2 | tr -d ' ' | tr -d '"' | tr -d "'")
  REPO=$(grep "^GITHUB_REPO=" .env | cut -d'=' -f2 | tr -d ' ' | tr -d '"' | tr -d "'")
  
  if [ -n "$OWNER" ] && [ -n "$REPO" ]; then
    echo ""
    echo "Testing repository access: $OWNER/$REPO"
    REPO_RESPONSE=$(curl -s -w "\n%{http_code}" \
      -H "Authorization: token $TOKEN" \
      -H "Accept: application/vnd.github.v3+json" \
      "https://api.github.com/repos/$OWNER/$REPO")
    REPO_HTTP=$(echo "$REPO_RESPONSE" | tail -1)
    
    if [ "$REPO_HTTP" = "200" ]; then
      echo "✅ Can access repository!"
      echo ""
      echo "🎉 Everything looks good! Token should work for PR creation."
    elif [ "$REPO_HTTP" = "404" ]; then
      echo "⚠️  Repository not found: $OWNER/$REPO"
      echo "   Check GITHUB_OWNER and GITHUB_REPO in .env"
    elif [ "$REPO_HTTP" = "403" ]; then
      echo "❌ Access denied to repository"
      echo "   Token might not have 'repo' scope or repository is private"
    else
      echo "⚠️  Unexpected response: HTTP $REPO_HTTP"
    fi
  else
    echo ""
    echo "⚠️  GITHUB_OWNER or GITHUB_REPO not set in .env"
  fi
  
else
  echo "❌ Authentication failed (HTTP $HTTP_CODE)"
  ERROR_MSG=$(echo "$BODY" | grep -o '"message":"[^"]*' | cut -d'"' -f4)
  if [ -n "$ERROR_MSG" ]; then
    echo "   Error: $ERROR_MSG"
  fi
  echo ""
  echo "💡 Solutions:"
  echo "   1. Regenerate token: https://github.com/settings/tokens/new"
  echo "   2. Make sure token has 'repo' scope"
  echo "   3. Check token hasn't expired"
  exit 1
fi

echo ""
echo "✅ Token test complete!"

