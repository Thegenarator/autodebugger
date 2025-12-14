#!/bin/bash
# Debug script for GitHub 401 error

echo "🔍 Debugging GitHub 401 Error..."
echo ""

cd ~/autodebugger || exit 1

# Check .env exists
echo "1. Checking .env file..."
if [ ! -f .env ]; then
  echo "   ❌ .env file not found!"
  echo "   💡 Copy from Windows: cp /mnt/c/Users/MK/Desktop/AutoDebugger/.env .env"
  exit 1
else
  echo "   ✅ .env file exists"
fi

# Check GITHUB_TOKEN
echo ""
echo "2. Checking GITHUB_TOKEN..."
TOKEN_LINE=$(grep "^GITHUB_TOKEN=" .env | head -1)
if [ -z "$TOKEN_LINE" ]; then
  echo "   ❌ GITHUB_TOKEN not found in .env"
  exit 1
else
  TOKEN=$(echo "$TOKEN_LINE" | cut -d'=' -f2 | tr -d ' ' | tr -d '"' | tr -d "'")
  echo "   ✅ GITHUB_TOKEN found"
  echo "   Token preview: ${TOKEN:0:10}..."
  
  # Check format
  if [[ $TOKEN =~ ^ghp_ ]]; then
    echo "   ✅ Token format correct (ghp_...)"
  elif [[ $TOKEN =~ ^github_pat_ ]]; then
    echo "   ✅ Token format correct (github_pat_...)"
  else
    echo "   ⚠️  Token format might be wrong (should start with ghp_ or github_pat_)"
  fi
fi

# Check GITHUB_OWNER
echo ""
echo "3. Checking GITHUB_OWNER..."
OWNER=$(grep "^GITHUB_OWNER=" .env | head -1 | cut -d'=' -f2 | tr -d ' ' | tr -d '"' | tr -d "'")
if [ -z "$OWNER" ]; then
  echo "   ⚠️  GITHUB_OWNER not set (using default: your-username)"
else
  echo "   ✅ GITHUB_OWNER: $OWNER"
fi

# Check GITHUB_REPO
echo ""
echo "4. Checking GITHUB_REPO..."
REPO=$(grep "^GITHUB_REPO=" .env | head -1 | cut -d'=' -f2 | tr -d ' ' | tr -d '"' | tr -d "'")
if [ -z "$REPO" ]; then
  echo "   ⚠️  GITHUB_REPO not set (using default: autodebugger)"
else
  echo "   ✅ GITHUB_REPO: $REPO"
fi

# Test token with GitHub API
echo ""
echo "5. Testing GitHub token..."
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: token $TOKEN" https://api.github.com/user)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
  USERNAME=$(echo "$BODY" | grep -o '"login":"[^"]*' | cut -d'"' -f4)
  echo "   ✅ Token is valid!"
  echo "   Authenticated as: $USERNAME"
elif [ "$HTTP_CODE" = "401" ]; then
  echo "   ❌ Token authentication failed (401)"
  echo "   Error: $(echo "$BODY" | grep -o '"message":"[^"]*' | cut -d'"' -f4)"
  echo ""
  echo "   💡 Solutions:"
  echo "   1. Regenerate token: https://github.com/settings/tokens/new"
  echo "   2. Make sure token has 'repo' scope"
  echo "   3. Check token hasn't expired"
  exit 1
else
  echo "   ⚠️  Unexpected response: HTTP $HTTP_CODE"
  echo "   Response: $BODY"
fi

# Test repository access
if [ -n "$OWNER" ] && [ -n "$REPO" ]; then
  echo ""
  echo "6. Testing repository access..."
  REPO_RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: token $TOKEN" \
    "https://api.github.com/repos/$OWNER/$REPO")
  REPO_HTTP_CODE=$(echo "$REPO_RESPONSE" | tail -1)
  REPO_BODY=$(echo "$REPO_RESPONSE" | head -n -1)
  
  if [ "$REPO_HTTP_CODE" = "200" ]; then
    echo "   ✅ Can access repository: $OWNER/$REPO"
  elif [ "$REPO_HTTP_CODE" = "404" ]; then
    echo "   ❌ Repository not found: $OWNER/$REPO"
    echo "   💡 Check GITHUB_OWNER and GITHUB_REPO in .env"
  elif [ "$REPO_HTTP_CODE" = "403" ]; then
    echo "   ❌ Access denied to repository"
    echo "   💡 Token might not have 'repo' scope or repository is private"
  else
    echo "   ⚠️  Unexpected response: HTTP $REPO_HTTP_CODE"
  fi
fi

echo ""
echo "✅ Debug complete!"
echo ""
echo "If token test passed but PR creation still fails, check:"
echo "  1. Token has 'repo' scope (not just 'public_repo')"
echo "  2. GITHUB_OWNER and GITHUB_REPO are correct"
echo "  3. Repository exists and token has access"

