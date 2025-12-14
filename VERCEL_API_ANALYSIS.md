# 🚀 Vercel API Integration Analysis

Complete documentation of all Vercel API calls in AutoDebugger.

---

## 📍 **Main Integration File**

**File**: `src/automation/vercel-integration.js`

This file contains **ALL real Vercel API calls** using `axios` with Bearer token authentication.

---

## 🔌 **Vercel API Endpoints Called**

### 1. **Create Deployment** (POST)
**Location**: `src/automation/vercel-integration.js:23-42`

```javascript
POST https://api.vercel.com/v13/deployments
```

**Headers**:
```javascript
{
  Authorization: `Bearer ${this.vercelToken}`,
  'Content-Type': 'application/json'
}
```

**Query Parameters**:
- `teamId` (optional) - If `VERCEL_TEAM_ID` is set

**Request Body**:
```javascript
{
  name: this.projectId,  // VERCEL_PROJECT_ID
  gitSource: {           // Optional, if prNumber provided
    type: 'github',
    ref: `pull/${prNumber}/head`,
    repo: process.env.GITHUB_REPO
  }
}
```

**Return Data**:
```javascript
{
  success: true,
  deploymentId: data.id,
  url: data.url,           // Deployment URL (e.g., https://app-xxx.vercel.app)
  state: data.readyState,  // 'BUILDING', 'READY', 'ERROR', etc.
  message: `Deployment triggered: ${data.url}`
}
```

**When Called**:
- `deploy()` - Direct deployment trigger
- `redeployAfterFix(prNumber)` - After PR is merged (Line 62-69)

**Trigger**: 
- Step 7 of autonomous loop: "Redeploy on Vercel"
- Called from `src/core/autonomous-loop.js:148`

---

### 2. **Get Deployment Status** (GET)
**Location**: `src/automation/vercel-integration.js:75-100`

```javascript
GET https://api.vercel.com/v13/deployments/{deploymentId}
```

**Headers**:
```javascript
{
  Authorization: `Bearer ${this.vercelToken}`
}
```

**Query Parameters**:
- `teamId` (optional) - If `VERCEL_TEAM_ID` is set

**Return Data**:
```javascript
{
  id: data.id,
  url: data.url,
  state: data.readyState,      // Current state
  createdAt: data.createdAt,     // ISO timestamp
  buildingAt: data.buildingAt,    // ISO timestamp
  readyAt: data.readyAt          // ISO timestamp
}
```

**When Called**:
- `getDeploymentStatus(deploymentId)` - Check specific deployment status
- Currently **not directly called** in autonomous loop, but available for polling

**Trigger**: Manual call or polling mechanism

---

### 3. **Check Deployment Health** (GET)
**Location**: `src/automation/vercel-integration.js:105-124`

```javascript
GET {deploymentUrl}/health
```

**Note**: This is **NOT** a Vercel API call - it's a health check to the deployed application itself.

**Timeout**: 5000ms (5 seconds)

**Return Data**:
```javascript
{
  healthy: true/false,     // true if status 200
  status: 200,            // HTTP status code
  url: deploymentUrl
}
```

**When Called**:
- `checkDeploymentHealth(url)` - Verify deployment is responding
- Step 8 of autonomous loop: "Verify deployment health"
- Called from `src/core/autonomous-loop.js:159`

**Trigger**: After redeployment to verify the fix worked

---

### 4. **Get Deployment Logs** (GET)
**Location**: `src/automation/vercel-integration.js:129-159`

```javascript
GET https://api.vercel.com/v2/deployments/{deploymentId}/events
```

**Headers**:
```javascript
{
  Authorization: `Bearer ${this.vercelToken}`
}
```

**Query Parameters**:
- `teamId` (optional) - If `VERCEL_TEAM_ID` is set

**Return Data**:
```javascript
{
  deploymentId: deploymentId,
  logs: data,                    // All events
  errorLogs: errorLogs,          // Filtered error events
  totalEvents: data.length
}
```

**Error Filtering** (Line 142-148):
Filters events where:
- `event.type === 'command'`
- `event.payload?.text` contains: 'error', 'Error', 'failed', 'Failed'

**When Called**:
- `getDeploymentLogs(deploymentId)` - Fetch logs for a specific deployment
- Called from `api/diagnose.js:38-47` when `sourceType === 'vercel'`

**Trigger**: 
- Dashboard diagnose feature with Vercel deployment ID
- API endpoint: `POST /api/diagnose` with `sourceType: 'vercel'` and `deploymentId`

---

### 5. **Get Latest Deployments** (GET)
**Location**: `src/automation/vercel-integration.js:164-191`

```javascript
GET https://api.vercel.com/v6/deployments
```

**Headers**:
```javascript
{
  Authorization: `Bearer ${this.vercelToken}`
}
```

**Query Parameters**:
- `teamId` (optional) - If `VERCEL_TEAM_ID` is set
- `projectId` - `VERCEL_PROJECT_ID` (required)
- `limit` - Number of deployments to fetch (default: 10)

**Return Data**:
```javascript
[
  {
    id: deployment.uid,
    url: deployment.url,
    state: deployment.readyState,    // 'READY', 'ERROR', 'CANCELED', etc.
    createdAt: deployment.createdAt,
    buildingAt: deployment.buildingAt,
    readyAt: deployment.readyAt
  },
  // ... more deployments
]
```

**When Called**:
- `getLatestDeployments(limit)` - Get recent deployments
- Used internally by `getFailedDeployments()` (Line 198)

**Trigger**: Internal helper function

---

### 6. **Get Failed Deployments** (GET)
**Location**: `src/automation/vercel-integration.js:196-205`

**Note**: This doesn't make a direct API call - it calls `getLatestDeployments()` and filters results.

**Logic**:
```javascript
1. Call getLatestDeployments(limit * 2)  // Get more to filter
2. Filter: d.state === 'ERROR' || d.state === 'CANCELED'
3. Return first 'limit' failed deployments
```

**Return Data**:
```javascript
[
  {
    id: deployment.uid,
    url: deployment.url,
    state: 'ERROR' or 'CANCELED',
    createdAt: deployment.createdAt,
    buildingAt: deployment.buildingAt,
    readyAt: deployment.readyAt
  },
  // ... more failed deployments
]
```

**When Called**:
- `getFailedDeployments(limit)` - Get failed deployments for monitoring
- Called from `api/monitor.js:47` when `VERCEL_TOKEN` and `vercelProjectId` are set
- Called from `api/logs.js:49` when `source === 'vercel'`

**Trigger**:
- Dashboard monitoring: `GET /api/monitor?vercelProjectId=xxx`
- Dashboard logs: `GET /api/logs?source=vercel&vercelProjectId=xxx`
- Automatic refresh every 30 seconds in dashboard (web/index.html:979)

---

## 🔄 **When Vercel APIs Are Called**

### **1. Autonomous Recovery Loop**
**File**: `src/core/autonomous-loop.js`

**Step 7 - Redeploy** (Line 147-154):
```javascript
const deployResult = await this.vercel.redeployAfterFix(prResult.prNumber);
```
- Calls: `POST /v13/deployments`
- Trigger: After PR is created and CodeRabbit review completes
- Purpose: Deploy the fixed code

**Step 8 - Verify** (Line 157-172):
```javascript
const healthCheck = await this.vercel.checkDeploymentHealth(deployResult.url);
```
- Calls: `GET {deploymentUrl}/health` (not Vercel API, but health check)
- Trigger: After redeployment
- Purpose: Verify deployment is healthy

---

### **2. Dashboard Monitoring**
**File**: `api/monitor.js` (Line 41-52)

**Trigger**: 
- `GET /api/monitor?vercelProjectId=xxx`
- Called automatically every 30 seconds by dashboard (web/index.html:979)
- Called manually from dashboard UI

**Calls**:
- `getFailedDeployments(3)` → `getLatestDeployments(6)` → `GET /v6/deployments`

**Return Data**:
```javascript
{
  vercel: {
    failedDeployments: [
      { id, url, state, createdAt, ... }
    ]
  }
}
```

---

### **3. Dashboard Logs**
**File**: `api/logs.js` (Line 42-57)

**Trigger**:
- `GET /api/logs?source=vercel&vercelProjectId=xxx`
- Called from dashboard when user clicks "Fetch Logs"

**Calls**:
- `getFailedDeployments(5)` → `getLatestDeployments(10)` → `GET /v6/deployments`

**Return Data**:
```javascript
{
  vercel: {
    failedDeployments: [...],
    message: "Found X failed deployment(s)"
  }
}
```

---

### **4. Diagnose with Vercel Logs**
**File**: `api/diagnose.js` (Line 38-47)

**Trigger**:
- `POST /api/diagnose` with:
  ```javascript
  {
    sourceType: 'vercel',
    deploymentId: 'deployment-id-here',
    demo: false
  }
  ```

**Calls**:
- `getDeploymentLogs(deploymentId)` → `GET /v2/deployments/{id}/events`

**Return Data**:
- Logs are extracted and passed to AI diagnosis
- Error logs are filtered and analyzed

---

## 🔍 **How Deployment Failures Are Detected**

### **Method 1: State-Based Detection**
**Location**: `src/automation/vercel-integration.js:196-205`

```javascript
async getFailedDeployments(limit = 5) {
  const deployments = await this.getLatestDeployments(limit * 2);
  return deployments
    .filter(d => d.state === 'ERROR' || d.state === 'CANCELED')
    .slice(0, limit);
}
```

**Detection Logic**:
- Fetches latest deployments from Vercel API
- Filters by `state === 'ERROR'` or `state === 'CANCELED'`
- Returns failed deployments

**States That Indicate Failure**:
- `'ERROR'` - Deployment failed
- `'CANCELED'` - Deployment was canceled

**States That Indicate Success**:
- `'READY'` - Deployment successful
- `'BUILDING'` - Still in progress (not a failure yet)

---

### **Method 2: Log-Based Detection**
**Location**: `src/automation/vercel-integration.js:129-159`

```javascript
async getDeploymentLogs(deploymentId) {
  // Fetch events
  const { data } = await axios.get(
    `${this.baseUrl}/v2/deployments/${deploymentId}/events`
  );
  
  // Filter for error events
  const errorLogs = data.filter(event => 
    event.type === 'command' && 
    (event.payload?.text?.includes('error') || 
     event.payload?.text?.includes('Error') ||
     event.payload?.text?.includes('failed') ||
     event.payload?.text?.includes('Failed'))
  );
}
```

**Detection Logic**:
- Fetches all deployment events
- Filters events where:
  - `type === 'command'`
  - Payload text contains error keywords: 'error', 'Error', 'failed', 'Failed'
- Returns filtered error logs

---

### **Method 3: Health Check Detection**
**Location**: `src/automation/vercel-integration.js:105-124`

```javascript
async checkDeploymentHealth(url) {
  const response = await axios.get(`${url}/health`, {
    timeout: 5000,
    validateStatus: (status) => status < 500
  });
  
  return {
    healthy: response.status === 200,
    status: response.status,
    url
  };
}
```

**Detection Logic**:
- Makes HTTP GET request to `{deploymentUrl}/health`
- If status is 200 → healthy
- If status is not 200 or request fails → unhealthy

**Note**: This requires the deployed app to have a `/health` endpoint.

---

### **Method 4: HTTP Status Detection**
**Location**: `src/automation/cline-automation-api.js:32-70`

```javascript
async checkDeployment(url) {
  const response = await fetch(url, { 
    method: 'GET',
    signal: AbortSignal.timeout(5000)
  });
  
  return {
    healthy: response.ok,  // true if status 200-299
    status: response.status,
    errors: response.ok ? [] : [{
      type: 'http_error',
      message: `HTTP ${response.status}: ${response.statusText}`,
      severity: response.status >= 500 ? 'high' : 'medium'
    }]
  };
}
```

**Detection Logic**:
- Makes HTTP GET to deployment URL
- If `response.ok` (status 200-299) → healthy
- If status >= 500 → high severity error
- If status 400-499 → medium severity error
- If connection fails → connection error

---

## 📊 **Data Flow: Failure Detection**

### **Scenario 1: Dashboard Monitoring**

```
1. Dashboard loads → setInterval(loadStatus, 30000)
2. Every 30s → GET /api/monitor?vercelProjectId=xxx
3. api/monitor.js → vercel.getFailedDeployments(3)
4. getFailedDeployments() → getLatestDeployments(6)
5. GET /v6/deployments → Filter by state === 'ERROR'
6. Return failed deployments to dashboard
7. Dashboard displays failed deployments
```

---

### **Scenario 2: Autonomous Loop Detection**

```
1. User runs: autonomous <deployment-url>
2. cline.checkDeployment(url) → HTTP GET to URL
3. If response.ok === false → Failure detected
4. Continue with autonomous loop:
   - Summarize errors (Kestra)
   - Decide fix (Oumi)
   - Generate fix (Cline)
   - Create PR (GitHub)
   - Redeploy (Vercel API)
   - Verify health (Health check)
```

---

### **Scenario 3: Diagnose with Vercel Logs**

```
1. User provides deploymentId in dashboard
2. POST /api/diagnose { sourceType: 'vercel', deploymentId: 'xxx' }
3. api/diagnose.js → vercel.getDeploymentLogs(deploymentId)
4. GET /v2/deployments/{id}/events
5. Filter error events
6. Pass logs to AI for diagnosis
7. Return diagnosis with suggested fixes
```

---

## 🔐 **Authentication**

**All Vercel API calls use**:
```javascript
headers: {
  Authorization: `Bearer ${this.vercelToken}`
}
```

Where `this.vercelToken = process.env.VERCEL_TOKEN`

**Required Environment Variables**:
- `VERCEL_TOKEN` - Vercel API token (required for all calls)
- `VERCEL_TEAM_ID` - Team ID (optional, added as query param if set)
- `VERCEL_PROJECT_ID` - Project ID (required for deployment operations)

---

## 📝 **Summary**

### **Vercel API Endpoints Used**:
1. ✅ `POST /v13/deployments` - Create/redeploy
2. ✅ `GET /v13/deployments/{id}` - Get deployment status
3. ✅ `GET /v2/deployments/{id}/events` - Get deployment logs
4. ✅ `GET /v6/deployments` - List deployments

### **Failure Detection Methods**:
1. ✅ **State-based**: Filter deployments by `state === 'ERROR'`
2. ✅ **Log-based**: Filter events containing error keywords
3. ✅ **Health check**: HTTP GET to `/health` endpoint
4. ✅ **HTTP status**: Check response status code

### **Triggers**:
1. ✅ **Autonomous loop**: After PR creation, redeploy and verify
2. ✅ **Dashboard monitoring**: Every 30 seconds
3. ✅ **Manual diagnose**: User provides deployment ID
4. ✅ **Logs API**: User requests logs for a deployment

### **All Calls Are Real**:
- ✅ Uses real `https://api.vercel.com` endpoints
- ✅ Uses real Bearer token authentication
- ✅ Returns real deployment data
- ✅ No mocking in `vercel-integration.js`

---

## 🎯 **To Enable Real Vercel Integration**:

1. Set `VERCEL_TOKEN` in Vercel project settings or `.env`
2. Set `VERCEL_PROJECT_ID` (your Vercel project ID)
3. Optionally set `VERCEL_TEAM_ID` if using team account
4. Redeploy application
5. Dashboard will automatically detect failed deployments
6. Autonomous loop will use real Vercel API for redeployment

