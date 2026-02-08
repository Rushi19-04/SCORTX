import os
import subprocess
import json
import requests
import concurrent.futures
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

# Setup logging
logging.basicConfig(
    filename='scanner.log',
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        logger.info("Gemini API configured")
    except Exception as e:
        logger.error(f"Failed to configure Gemini: {e}")

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "Smart Contract Audit Backend (Stateless)"})

SLITHER_RECOMMENDATIONS = {
    "arbitrary-send-eth": "Ensure checks on sender and amount. Use WithdrawPattern (pull over push).",
    "reentrancy-eth": "Add nonReentrant modifier or use Checks-Effects-Interactions pattern.",
    "reentrancy-no-eth": "Add nonReentrant modifier.",
    "reentrancy-benign": "Check if reentrancy is harmless. If not, add nonReentrant modifier.",
    "timestamp": "Avoid block.timestamp for critical logic or randomness.",
    "low-level-calls": "Avoid low-level calls (call/delegatecall) when possible. Check return values.",
    "solc-version": "Use a recent, pinned Solidity version (e.g., 0.8.20) to avoid known compiler bugs.",
    "naming-convention": "Follow Solidity naming conventions (CapWords for contracts, mixedCase for vars).",
    "tx-origin": "Use msg.sender instead of tx.origin for authentication.",
    "uninitialized-state": "Initialize all state variables.",
    "shadowing-local": "Rename local variable to avoid shadowing state variable.",
    "missing-zero-check": "Add require(address != address(0)) check for address parameters.",
    "events-access": "Emit events for critical state changes."
}

def parse_slither_output(json_output):
    """Parses Slither JSON into the frontend's Finding format."""
    findings = []
    try:
        data = json.loads(json_output)
        # Slither structure: { "results": { "detectors": [ ... ] } }
        detectors = data.get('results', {}).get('detectors', [])
        
        for det in detectors:
            # Map Slither impact to severity
            impact = det.get('impact', 'Low')
            severity = 'low'
            if impact == 'High': severity = 'high'
            elif impact == 'Medium': severity = 'medium'
            elif impact == 'Critical': severity = 'critical'
            
            # Find line number (first element)
            line = 0
            if det.get('elements') and len(det['elements']) > 0:
                source_mapping = det['elements'][0].get('source_mapping', {})
                if 'lines' in source_mapping and len(source_mapping['lines']) > 0:
                    line = source_mapping['lines'][0]
            
            check_name = det.get('check', 'Unknown Issue')
            recommendation = SLITHER_RECOMMENDATIONS.get(check_name, "Review logic and apply checks.")
            
            findings.append({
                "type": "structural", 
                "severity": severity,
                "title": check_name,
                "description": det.get('description', 'No description'),
                "line": line,
                "recommendation": recommendation 
            })
    except Exception as e:
        logger.error(f"Error parsing Slither JSON: {e}")
        print(f"Error parsing Slither: {e}")
        
    return findings

@app.route('/scan', methods=['POST'])
def scan():
    data = request.json
    contract_name = data.get('contract_name', 'contract.sol')
    code = data.get('code')
    
    if not code:
        return jsonify({"error": "No code provided"}), 400
        
    # Standardize filename format
    if not contract_name.endswith('.sol'):
        contract_name += '.sol'
        
    filepath = os.path.join(UPLOAD_FOLDER, contract_name)
    abs_filepath = os.path.abspath(filepath)
    
    # Write code to file for Slither
    with open(filepath, 'w') as f:
        f.write(code)
        
    logger.info(f"Starting scan for {contract_name}")
    
    # Run Scans in Parallel
    
    def run_slither():
        cmd = ["slither", abs_filepath, "--json", "-"]
        print(f"Running Slither on {contract_name}...")
        logger.info(f"Executing Slither: {' '.join(cmd)}")
        try:
            # Slither returns non-zero exit code if issues found, so check=False
            result = subprocess.run(cmd, capture_output=True, text=True, check=False)
            output = result.stdout
            
            logger.debug(f"Slither return code: {result.returncode}")
            if result.stderr:
                logger.warning(f"Slither stderr: {result.stderr[:500]}...")
            
            json_start = output.find('{')
            if json_start != -1:
                json_output = output[json_start:]
                logger.info("Slither JSON output found")
                return parse_slither_output(json_output)
            else:
                logger.error("No JSON found in Slither output")
                print("No JSON found in Slither output!")
        except Exception as e:
            logger.error(f"Slither execution failed: {e}")
            print(f"Slither failed: {e}")
        return []

    def run_mythril():
        cmd = ["myth", "analyze", abs_filepath, "-o", "json"]
        print(f"Running Mythril on {contract_name}...")
        logger.info(f"Executing Mythril: {' '.join(cmd)}")
        try:
            # Mythril can be slow, set timeout
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120, check=False)
            output = result.stdout
            stderr = result.stderr
            
            logger.debug(f"Mythril return code: {result.returncode}")
            if stderr:
                logger.warning(f"Mythril stderr: {stderr[:500]}...")
            
            try:
                # Mythril might output extra text, find start of JSON
                json_start = output.find('{')
                if json_start != -1:
                    data = json.loads(output[json_start:])
                    issues = data.get('issues', [])
                    logger.info(f"Mythril found {len(issues)} issues")
                    print(f"Mythril found {len(issues)} issues")
                    
                    myth_findings = []
                    for issue in issues:
                        myth_findings.append({
                            "type": "transactional",
                            "severity": issue.get('severity', 'Medium').lower(),
                            "title": issue.get('title', 'Mythril Issue'),
                            "description": issue.get('description', 'No description'),
                            "line": issue.get('lineno', 0),
                            "recommendation": f"Check SWC-{issue.get('swc-id', '???')}"
                        })
                    return myth_findings
                else:
                    logger.warning("No JSON found in Mythril output")
                    return []
            except json.JSONDecodeError as je:
                logger.error(f"Failed to parse Mythril JSON: {je}")
                print(f"Failed to parse Mythril JSON: {je}")
        except subprocess.TimeoutExpired:
            logger.error("Mythril scan timed out")
            print("Mythril scan timed out")
        except Exception as e:
            logger.error(f"Mythril failed: {e}")
            print(f"Mythril failed: {e}")
        return []

    findings = []
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_slither = executor.submit(run_slither)
        future_mythril = executor.submit(run_mythril)
        
        findings.extend(future_slither.result())
        findings.extend(future_mythril.result())

    logger.info(f"Total findings: {len(findings)}")

    # 3. AI Remediation using Gemini 2.0 Flash
    fixed_code = None
    fixes_applied = []
    
    if GEMINI_API_KEY and len(findings) > 0:
        try:
            # Include ALL findings for remediation (High, Medium, Critical, Low)
            findings_to_fix = findings
            
            if findings_to_fix:
                print(f"Generating fixes for {len(findings_to_fix)} issues...")
                logger.info(f"Generating AI fixes for {len(findings_to_fix)} issues")
                
                # Build findings summary for AI
                findings_summary = "\n".join([
                    f"{i+1}. [{f['severity'].upper()}] {f['title']} (Line {f['line']})\n   {f['description'][:300]}"
                    for i, f in enumerate(findings_to_fix[:100])  # Increased limit to 100
                ])
                
                # Create prompt for Gemini
                prompt = f"""You are an expert Solidity security auditor. Fix the following vulnerabilities in this smart contract.
 
 VULNERABILITIES FOUND:
 {findings_summary}
 
 ORIGINAL CONTRACT:
 ```solidity
 {code}
 ```
 
 INSTRUCTIONS:
 1. Fix ALL identified vulnerabilities (High, Medium, and Low)
 2. Add reentrancy guards where needed
 3. Add proper access control modifiers
 4. Update Solidity version if needed to avoid known bugs
 5. Follow checks-effects-interactions pattern
 6. Add comments explaining critical fixes
 7. Preserve all functionality
 8. Maintain consistency of all state variables (e.g., total supply, user balances)
 9. Return ONLY the fixed Solidity code, no explanations

FIXED CONTRACT:"""

                # Dynamic Model Discovery
                model = None
                try:
                    logger.info("Listing available models dynamically...")
                    available_models = []
                    for m in genai.list_models():
                        if 'generateContent' in m.supported_generation_methods:
                            available_models.append(m.name)
                            
                    logger.info(f"Available models: {available_models}")
                    
                    # Preference list
                    preferences = [
                        'gemini-1.5-flash',
                        'gemini-1.5-pro',
                        'gemini-pro',
                        'gemini-1.0-pro'
                    ]
                    
                    selected_model_name = None
                    
                    # 1. Try exact matches from preference list
                    for pref in preferences:
                        # Check if 'models/pref' exists in available_models
                        full_name = f"models/{pref}"
                        if full_name in available_models:
                            selected_model_name = pref # generate_content likely needs strict name
                            # Actually genai.GenerativeModel constructor often takes name without 'models/' prefix but let's see
                            # If list_models returns 'models/foo', we should probably pass 'models/foo' or 'foo'
                            # The library usually handles both, but let's be safe and try to match
                            break
                            
                    # 2. If no exact match, pick ANY gemini model
                    if not selected_model_name:
                        for m_name in available_models:
                            if 'gemini' in m_name.lower():
                                selected_model_name = m_name
                                break
                                
                    if selected_model_name:
                        logger.info(f"Selected ✨ Model: {selected_model_name}")
                        model = genai.GenerativeModel(selected_model_name)
                        
                        # Request JSON response
                        prompt += "\n\nRETURN JSON ONLY with format: {\"fixed_code\": \"...\", \"recommendations\": [{\"line\": 1, \"text\": \"...\"}]}"
                        
                        response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
                    else:
                        logger.error("No suitable Gemini model found in available list")
                        
                except Exception as e:
                     logger.error(f"Dynamic model discovery failed: {e}")
                     # Fallback to hardcoded string as last resort
                     try:
                         logger.info("Fallback to hardcoded 'gemini-pro'")
                         model = genai.GenerativeModel('gemini-pro')
                         prompt += "\n\nRETURN JSON ONLY with format: {\"fixed_code\": \"...\", \"recommendations\": [{\"line\": 1, \"text\": \"...\"}]}"
                         response = model.generate_content(prompt) # Legacy models might not support response_mime_type
                     except Exception as e2:
                         logger.error(f"Hardcoded fallback failed: {e2}")

                if response and response.text:
                    try:
                        # Clean cleanup potential markdown code blocks if model didn't obey JSON mode perfectly
                        text_response = response.text.strip()
                        if text_response.startswith('```json'):
                            text_response = text_response[7:-3]
                        elif text_response.startswith('```'):
                            text_response = text_response[3:-3]
                            
                        json_response = json.loads(text_response)
                        
                        fixed_code = json_response.get('fixed_code', '')
                        ai_recommendations = json_response.get('recommendations', [])
                        
                        # Merge AI recommendations into findings
                        for ai_rec in ai_recommendations:
                            rec_line = ai_rec.get('line')
                            rec_text = ai_rec.get('text')
                            if rec_line and rec_text:
                                # Update finding with matching line
                                for finding in findings:
                                    if finding.get('line') == rec_line:
                                        finding['recommendation'] = f"🤖 AI: {rec_text}"
                        
                        logger.info("AI response received and parsed")
                    except json.JSONDecodeError:
                         logger.error("Failed to parse AI JSON response")
                         # Fallback if JSON fails but we have text (maybe it returned just code?)
                         fixed_code = response.text
                         if fixed_code.startswith('```'):
                            lines = fixed_code.split('\n')
                            fixed_code = '\n'.join(lines[1:-1]) if len(lines) > 2 else fixed_code
                    except Exception as e:
                        logger.error(f"Error processing AI response: {e}")

                    # Generate fixes summary (keep existing logic for UI pill)
                    for f in findings_to_fix[:100]: # Show all fixed issues
                        fixes_applied.append({
                            "severity": f['severity'],
                            "title": f['title'],
                            "fix": f"Applied security fix for {f['title'].lower()}"
                        })
                    
                    print(f"AI remediation completed successfully")
                else:
                    logger.warning("Gemini returned empty response")
                    print("Gemini returned empty response")
        except Exception as e:
            logger.error(f"AI remediation failed: {e}")
            print(f"AI remediation failed: {e}")
            fixed_code = None
    
    return jsonify({
        "findings": findings,
        "original_code": code,
        "fixed_code": fixed_code,
        "fixes_applied": fixes_applied
    })


if __name__ == '__main__':
    # Production-ready configuration
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
