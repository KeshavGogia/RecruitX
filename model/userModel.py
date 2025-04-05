from flask import Flask, request, jsonify
import fitz  # PyMuPDF
import requests
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

app = Flask(__name__)

def extract_text_from_pdf(url):
    response = requests.get(url)
    if response.status_code != 200:
        raise Exception(f"Failed to download PDF, status code: {response.status_code}")
    
    with open("temp_resume.pdf", "wb") as f:
        f.write(response.content)
    
    doc = fitz.open("temp_resume.pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def analyze_resume(job_desc, requirements, resume_text):
    prompt = f"""
Act like a skilled ATS system. Here is the information:

Job Description: {job_desc}
Requirements: {requirements}

Candidate Resume:
{resume_text}

Evaluate the resume:
1. Shortlisting Score (out of 100)
2. Matched Keywords
3. Missing Keywords
4. 3-5 Resume Improvement Suggestions
5. A one-line summary feedback

Respond strictly in this JSON format:
{{
    "shortlisting_score": <int>,
    "matched_keywords": [<list>],
    "missing_keywords": [<list>],
    "resume_improvements": [<list of suggestions>],
    "summary_feedback": <string>
}}
"""

    response = client.chat.completions.create(
        model="llama3-70b-8192",  # ✅ Correct model
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    try:
        content = response.choices[0].message.content.strip()
        return eval(content)
    except Exception as e:
        return {"error": "Failed to parse model output", "details": str(e)}

@app.route('/evaluate', methods=['POST'])
def evaluate():
    try:
        data = request.json
        job_desc = data.get("job_description")
        requirements = data.get("requirements")
        resume_url = data.get("resume_url")

        if not all([job_desc, requirements, resume_url]):
            return jsonify({"error": "Missing fields"}), 400

        resume_text = extract_text_from_pdf(resume_url)
        result = analyze_resume(job_desc, requirements, resume_text)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": "Something went wrong", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(port=9000)
