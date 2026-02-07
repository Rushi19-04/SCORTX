
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=api_key)

print("Searching for Gemini models...")
found = False
for m in genai.list_models():
    if 'gemini' in m.name.lower():
        print(m.name)
        found = True

if not found:
    print("No Gemini models found. All models:")
    for m in genai.list_models():
        print(m.name)
