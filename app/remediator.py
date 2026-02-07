import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

# Load env variables from root .env if present
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

def generate_fix(vulnerabilities, original_code):
    """
    Generates a secure version of the code using Gemini.
    """
    if not api_key:
        return "// Gemini API Key not found. Please set GEMINI_API_KEY in .env.\n" + original_code

    prompt = f"""
    You are a Smart Contract Security Expert.
    Analyze the following Solidity code and the detected vulnerabilities.
    
    Vulnerabilities:
    {json.dumps(vulnerabilities, indent=2)}
    
    Code:
    ```solidity
    {original_code}
    ```
    
    Task:
    Return the FULLY CORRECTED Solidity code. Do not add markdown backticks. Just the code.
    Fix all issues mentioned.
    """
    
    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        patched_code = response.text
        
        # Strip backticks if LLM adds them
        patched_code = patched_code.replace("```solidity", "").replace("```", "")
        return patched_code
    except Exception as e:
        return f"// Error calling Gemini: {str(e)}\n" + original_code

def verify_fix(patched_filename):
    """
    Runs slither on the patched file to verify if issues are resolved.
    """
    # This runs on the host, so we call docker exec just like app.py
    cmd = [
        "docker", "exec", "audit_scanner", 
        "slither", f"/code/{patched_filename}", "--json", "-"
    ]
    
    try:
        # We need subprocess
        import subprocess
        result = subprocess.run(cmd, capture_output=True, text=True)
        output = result.stdout
        
        # Helper to parse output
        # If clean, validation passes
        if result.returncode == 0:
            return {"status": "Clean", "details": "No issues found"}
        else:
            return {"status": "Issues Found", "details": output[:200] + "..."}
            
    except Exception as e:
        return {"error": str(e)}
