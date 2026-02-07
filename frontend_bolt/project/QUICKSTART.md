# SCORTX - Smart Contract Security Scanner

**SCORTX** is a free, public-facing smart contract security scanner. Users upload Solidity contracts and instantly receive vulnerability analysis with AI-powered remediation suggestions.

## Quick Start

### 1. Configure Supabase

Add your Supabase credentials to `.env`:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Start the Docker Security Engine

SCORTX requires a local Docker container with security analysis tools:

```bash
docker run -it -p 5000:5000 trailofbits/eth-security-toolbox
```

Inside the container, set up the Flask API bridge (see `DOCKER_SETUP.md`):

```bash
pip install flask flask-cors
python scan_api.py
```

### 3. Launch the Website

```bash
npm install
npm run dev
```

Navigate to the provided URL (usually `http://localhost:5173`).

## User Flow

1. **Landing Page** - Explains what SCORTX does
2. **Upload File** - User drags/drops or selects a `.sol` file
3. **Scan Progress** - Real-time animation showing analysis phases:
   - Parsing Bytecode
   - Symbolic Execution
   - Pattern Matching
   - AI Remediation
4. **View Results** - See:
   - Summary of all vulnerabilities
   - Detailed findings with severity levels
   - AI-remediated code ready to copy
   - Recommendations for each issue
5. **Scan Another** - Users can immediately test another contract

## Features

✓ **Instant Analysis** - Powered by Mythril and Slither
✓ **Severity Classification** - Critical, High, Medium, Low
✓ **Detailed Explanations** - What each vulnerability means
✓ **AI Remediation** - Automatically patched code
✓ **Copy to Clipboard** - Easy export of fixed code
✓ **No Registration** - Completely free and anonymous

## Architecture

```
User Browser
    ↓
React Frontend (SCORTX Website)
    ↓ HTTP POST
Docker Container (localhost:5000)
    ├── Flask API
    ├── Slither (Static Analysis)
    ├── Mythril (Symbolic Execution)
    └── Solidity Compiler
    ↓
Supabase (Results Storage)
```

## Testing

Use the sample vulnerable contract to test:

```bash
# In your browser, upload this test contract
test-contracts/VulnerableBank.sol
```

Expected findings:
- **Reentrancy Vulnerability** (Critical) - From Mythril
- **Missing Events** (Low) - From Slither
- **Unsafe Pattern** (Medium) - From pattern matching

## API Endpoint

The Flask bridge communicates with the scanner at:

```
POST http://localhost:5000/scan

Request:
{
  "contract_name": "MyContract.sol",
  "code": "pragma solidity ^0.8.0;\n..."
}

Response:
{
  "findings": [
    {
      "type": "transactional",
      "severity": "high",
      "title": "Reentrancy Vulnerability",
      "description": "...",
      "line": 42,
      "recommendation": "..."
    }
  ],
  "fixed_code": "// Remediated code..."
}
```

## Deployment

To deploy SCORTX publicly:

1. Deploy Docker engine on a secure cloud server
2. Deploy React app to Vercel, Netlify, or your hosting
3. Update API endpoint from `localhost:5000` to your server
4. Set up Supabase database for data persistence

## Next Steps

- Enhance AI remediation with real LLM integration (GPT-4, Claude)
- Add support for more tools (Oyente, Certora)
- Implement batch scanning
- Add audit report export (PDF)
- Set up CI/CD integration for repos
