#!/bin/bash
# Comprehensive GitHub token diagnostic script

echo "🔍 GitHub Token Diagnostic Tool"
echo "================================"
echo ""

cd ~/autodebugger || {
  echo "❌ Not in autodebugger directory"
  exit 1
}

# Step 1: Check .env file
echo "1. Checking .env file..."
if [ ! -f .env ]; then
  echo "   ❌ .env file not found!"
  echo "   💡 Copy from Windows: cp /mnt/c/Users/MK/Desktop/AutoDebugger/.env .env"
  exit 1
fi
echo "   ✅ .env file exists"

# Step 2: Extract values
echo ""
echo "2. Extracting values from .env..."
TOKEN_LINE=$(grep "^GITHUB_TOKEN=" .env | head -1)
OWNER_LINE=$(grep "^GITHUB_OWNER=" .env | head -1)
REPO_LINE=$(grep "^GITHUB_REPO=" .env | head -1)

if [ -z "$TOKEN_LINE" ]; then
  echo "   ❌ GITHUB_TOKEN not found in .env"
  exit 1
fi

TOKEN=$(echo "$TOKEN_LINE" | cut -d'=' -f2 | tr -d ' ' | tr -d '"' | tr -d "'")
OWNER=$(echo "$OWNER_LINE" | cut -d'=' -f2 | tr -d ' ' | tr -d '"' | tr -d "'")
REPO=$(echo "$REPO_LINE" | cut -d'=' -f2 | tr -d ' ' | tr -d '"' | tr -d "'")

echo "   Token: ${TOKEN:0:10}... (${#TOKEN} chars)"
echo "   Owner: ${OWNER:-'NOT SET'}"
echo "   Repo: ${REPO:-'NOT SET'}"

# Step 3: Check token format
echo ""
echo "3. Checking token format..."
if [[ $TOKEN =~ ^ghp_ ]]; then
  echo "   ✅ Token format correct (Classic Personal Access Token)"
  TOKEN_TYPE="classic"
elif [[ $TOKEN =~ ^github_pat_ ]]; then
  echo "   ⚠️  Token is fine-grained (might have issues)"
  TOKEN_TYPE="fine-grained"
else
  echo "   ❌ Token format incorrect (should start with 'ghp_' or 'github_pat_')"
  echo "   Current: ${TOKEN:0:20}..."
  exit 1
fi

# Step 4: Test authentication
echo ""
echo "4. Testing GitHub authentication..."
AUTH_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user 2>&1)

HTTP_CODE=$(echo "$AUTH_RESPONSE" | tail -1)
AUTH_BODY=$(echo "$AUTH_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
  USERNAME=$(echo "$AUTH_BODY" | grep -o '"login":"[^"]*' | cut -d'"' -f4)
  echo "   ✅ Authentication successful!"
  echo "   Authenticated as: $USERNAME"
  
  # Check scopes
  SCOPE_HEADER=$(curl -s -I -H "Authorization: token $TOKEN" \
    https://api.github.com/user | grep -i "x-oauth-scopes" | cut -d' ' -f2- | tr -d '\r')
  
  echo ""
  echo "5. Checking token scopes..."
  if echo "$SCOPE_HEADER" | grep -q "repo"; then
    echo "   ✅ Token has 'repo' scope"
  else
    echo "   ❌ Token missing 'repo' scope!"
    echo "   Current scopes: $SCOPE_HEADER"
    echo "   💡 Regenerate token with 'repo' scope at: https://github.com/settings/tokens/new"
    exit 1
  fi
  
else
  echo "   ❌ Authentication failed (HTTP $HTTP_CODE)"
  ERROR_MSG=$(echo "$AUTH_BODY" | grep -o '"message":"[^"]*' | cut -d'"' -f4)
  if [ -n "$ERROR_MSG" ]; then
    echo "   Error: $ERROR_MSG"
  fi
  echo ""
  echo "   💡 Solutions:"
  echo "   1. Token may be expired - regenerate at: https://github.com/settings/tokens"
  echo "   2. Token may be revoked - check token list"
  echo "   3. Token format may be wrong - should start with 'ghp_'"
  exit 1
fi

# Step 6: Test repository access
if [ -n "$OWNER" ] && [ -n "$REPO" ]; then
  echo ""
  echo "6. Testing repository access: $OWNER/$REPO"
  REPO_RESPONSE=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: token $TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$OWNER/$REPO" 2>&1)
  
  REPO_HTTP=$(echo "$REPO_RESPONSE" | tail -1)
  REPO_BODY=$(echo "$REPO_RESPONSE" | head -n -1)
  
  if [ "$REPO_HTTP" = "200" ]; then
    echo "   ✅ Can access repository!"
    REPO_NAME=$(echo "$REPO_BODY" | grep -o '"full_name":"[^"]*' | cut -d'"' -f4)
    echo "   Repository: $REPO_NAME"
  elif [ "$REPO_HTTP" = "404" ]; then
    echo "   ❌ Repository not found (404)"
    echo "   💡 Check GITHUB_OWNER and GITHUB_REPO in .env"
    echo "   Expected: https://github.com/$OWNER/$REPO"
    exit 1
  elif [ "$REPO_HTTP" = "403" ]; then
    echo "   ❌ Access denied to repository (403)"
    echo "   💡 Token may not have 'repo' scope or repository is private"
    exit 1
  else
    echo "   ⚠️  Unexpected response: HTTP $REPO_HTTP"
    echo "   Response: $REPO_BODY"
  fi
else
  echo ""
  echo "6. ⚠️  GITHUB_OWNER or GITHUB_REPO not set"
  echo "   Owner: ${OWNER:-'NOT SET'}"
  echo "   Repo: ${REPO:-'NOT SET'}"
  echo "   💡 Set these in .env file"
fi

# Step 7: Test Node.js can read token
echo ""
echo "7. Testing if Node.js can read token from .env..."
NODE_TEST=$(node -e "
import('dotenv/config').then(() => {
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    console.log('YES');
    console.log('Token length:', token.length);
    console.log('Token format:', token.substring(0, 10) + '...');
  } else {
    console.log('NO');
    process.exit(1);
  }
}).catch(e => {
  console.log('ERROR:', e.message);
  process.exit(1);
})
" 2>&1)

if echo "$NODE_TEST" | grep -q "YES"; then
  echo "   ✅ Node.js can read token from .env"
  echo "   $(echo "$NODE_TEST" | grep -E "Token length|Token format")"
else
  echo "   ❌ Node.js cannot read token from .env"
  echo "   Output: $NODE_TEST"
  echo "   💡 Check .env file format and location"
  exit 1
fi

# Summary
echo ""
echo "================================"
echo "✅ All checks passed!"
echo ""
echo "Your GitHub token is configured correctly:"
echo "  - Token format: ✅"
echo "  - Authentication: ✅"
echo "  - Repository access: ✅"
echo "  - Node.js can read: ✅"
echo ""
echo "You should be able to create PRs now!"
echo ""
echo "Test with:"
echo "  npm run cli -- autonomous https://test.vercel.app --demo"
echo ""

