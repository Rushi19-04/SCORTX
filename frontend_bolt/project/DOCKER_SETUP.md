# SCORTX Docker Brain Setup

This document explains how to set up the Docker-based security analysis engine that powers SCORTX.

## Architecture Overview

SCORTX uses a hybrid architecture:
- **Frontend (This App)**: Built with React + Vite, handles UI and data storage via Supabase
- **Backend (Docker)**: Runs security tools (Slither, Mythril) and provides API at `localhost:5000`

## Setting Up the Docker Brain

### Step 1: Start the Security Toolbox

```bash
docker run -it -p 5000:5000 trailofbits/eth-security-toolbox
```

This Docker image contains:
- Slither (static analysis)
- Mythril (symbolic execution)
- Solidity compiler
- Python runtime

### Step 2: Create the Flask API Bridge

Inside the Docker container, create a file `scan_api.py`:

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import json
import tempfile
import os

app = Flask(__name__)
CORS(app)

@app.route('/scan', methods=['POST'])
def scan_contract():
    try:
        data = request.json
        contract_name = data.get('contract_name', 'contract.sol')
        code = data.get('code', '')

        findings = []

        # Create temporary file for the contract
        with tempfile.NamedTemporaryFile(mode='w', suffix='.sol', delete=False) as f:
            f.write(code)
            temp_file = f.name

        try:
            # Run Slither (Static Analysis)
            try:
                slither_result = subprocess.run(
                    ['slither', temp_file, '--json', '-'],
                    capture_output=True,
                    text=True,
                    timeout=30
                )

                if slither_result.stdout:
                    slither_data = json.loads(slither_result.stdout)
                    for result in slither_data.get('results', {}).get('detectors', []):
                        severity_map = {
                            'High': 'high',
                            'Medium': 'medium',
                            'Low': 'low',
                            'Informational': 'low'
                        }
                        findings.append({
                            'type': 'structural',
                            'severity': severity_map.get(result.get('impact'), 'medium'),
                            'title': result.get('check', 'Unknown Issue'),
                            'description': result.get('description', ''),
                            'line': result.get('first_markdown_element', {}).get('source_mapping', {}).get('lines', [0])[0],
                            'recommendation': result.get('recommendation', '')
                        })
            except Exception as e:
                print(f"Slither error: {e}")

            # Run Mythril (Symbolic Execution)
            try:
                myth_result = subprocess.run(
                    ['myth', 'analyze', temp_file, '--output', 'json'],
                    capture_output=True,
                    text=True,
                    timeout=60
                )

                if myth_result.stdout:
                    myth_data = json.loads(myth_result.stdout)
                    for issue in myth_data.get('issues', []):
                        findings.append({
                            'type': 'transactional',
                            'severity': issue.get('severity', 'medium').lower(),
                            'title': issue.get('title', 'Unknown Vulnerability'),
                            'description': issue.get('description', ''),
                            'line': issue.get('lineno', 0),
                            'recommendation': issue.get('recommendation', '')
                        })
            except Exception as e:
                print(f"Mythril error: {e}")

            # Simple AI remediation (placeholder - integrate actual LLM here)
            fixed_code = None
            if findings:
                fixed_code = code + "\n\n// AI Remediation: Review findings and apply security patches"

        finally:
            os.unlink(temp_file)

        return jsonify({
            'success': True,
            'findings': findings,
            'fixed_code': fixed_code
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

### Step 3: Install Dependencies

Inside the Docker container:

```bash
pip install flask flask-cors
```

### Step 4: Start the API Server

```bash
python scan_api.py
```

The API will now be available at `http://localhost:5000/scan`

## API Endpoint

### POST /scan

Analyzes a Solidity smart contract for vulnerabilities.

**Request Body:**
```json
{
  "contract_name": "MyContract.sol",
  "code": "pragma solidity ^0.8.0;\n\ncontract MyContract { ... }"
}
```

**Response:**
```json
{
  "success": true,
  "findings": [
    {
      "type": "transactional",
      "severity": "high",
      "title": "Reentrancy Vulnerability",
      "description": "External call followed by state change",
      "line": 42,
      "recommendation": "Use checks-effects-interactions pattern"
    }
  ],
  "fixed_code": "// Remediated code..."
}
```

## Enhanced AI Remediation

To add real AI remediation, integrate an LLM (like OpenAI GPT or a local model):

```python
import openai

def ai_remediate(code, findings):
    prompt = f"""Fix these security issues in the following Solidity contract:

Issues:
{json.dumps(findings, indent=2)}

Code:
{code}

Provide the fixed code:"""

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content
```

## Troubleshooting

### Port 5000 Already in Use
```bash
docker run -it -p 5001:5000 trailofbits/eth-security-toolbox
```
Then update frontend to use port 5001.

### CORS Issues
Make sure Flask-CORS is installed and properly configured.

### Timeout Errors
Increase timeout values in subprocess.run() calls for complex contracts.
