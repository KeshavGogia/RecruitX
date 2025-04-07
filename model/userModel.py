from flask import Flask, request, jsonify
import fitz  # PyMuPDF
import requests
import os
import json
import time
from dotenv import load_dotenv
from groq import Groq
from flask_cors import CORS
import cloudinary
import cloudinary.uploader

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)


app = Flask(__name__) 
CORS(app, origins=["http://localhost:5173","http://localhost:5174"], supports_credentials=True)


GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

def extract_text_from_pdf(url, retries=3, delay=2):
    for attempt in range(retries):
        response = requests.get(url)
        if response.status_code == 200:
            with open("temp_resume.pdf", "wb") as f:
                f.write(response.content)

            doc = fitz.open("temp_resume.pdf")
            text = ""
            for page in doc:
                text += page.get_text()
            return text
        else:
            if attempt < retries - 1:
                time.sleep(delay) 
            else:
                raise Exception(f"Failed to download PDF after {retries} attempts. Status: {response.status_code}")

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

Respond strictly in valid parsable JSON format only. Do not add any explanation, markdown, or code blocks.
JSON format:
{{
    "shortlisting_score": <int>,
    "matched_keywords": [<list of strings>],
    "missing_keywords": [<list of strings>],
    "resume_improvements": [<list of suggestions>],
    "summary_feedback": "<string>"
}}
"""

    response = client.chat.completions.create(
        model="llama3-70b-8192",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    try:
        content = response.choices[0].message.content.strip()

        # Remove markdown/code block if LLM wraps it
        if content.startswith("```json"):
            content = content[7:].strip()
        if content.endswith("```"):
            content = content[:-3].strip()

        return json.loads(content)
    except Exception as e:
        return {
            "error": "Failed to parse model output",
            "details": str(e),
            "raw_output": content
        }

@app.route('/evaluate', methods=['POST'])
def evaluate():
    try:
        # Step 1: Extract job_number and resume file
        job_number = request.form.get("job_number")
        resume_file = request.files.get("resume")

        if not job_number or not resume_file:
            return jsonify({"error": "Missing job_number or resume"}), 400

        # Step 2: Upload resume to Cloudinary
        upload_result = cloudinary.uploader.upload(resume_file, resource_type="raw",type="upload")
        resume_url = upload_result.get("secure_url")

        if not resume_url:
            return jsonify({"error": "Failed to upload resume to Cloudinary"}), 500

        # Step 3: Fetch job description and requirements
        job_details_url = f"http://localhost:8000/job/details/{job_number}"
        job_response = requests.get(job_details_url, headers={"x-internal-call": "true"})

        if job_response.status_code != 200:
            return jsonify({"error": "Failed to fetch job details"}), 500

        job_data = job_response.json()
        job_desc = job_data.get("description")
        requirements = job_data.get("requirements")

        if not job_desc or not requirements:
            return jsonify({"error": "Incomplete job information"}), 500

        # Step 4: Analyze resume
        resume_text = extract_text_from_pdf(resume_url)
        result = analyze_resume(job_desc, requirements, resume_text)

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": "Something went wrong", "details": str(e)}), 500

@app.route('/recruiter/evaluate', methods=['POST'])
def recruiter_evaluate():
    try:
        data = request.json
        job_number = data.get("job_number")

        if not job_number:
            return jsonify({"error": "Missing job_number"}), 400

        # Step 1: Fetch job details
        job_details_url = f"http://localhost:8000/job/details/{job_number}"
        job_response = requests.get(job_details_url, headers={"x-internal-call": "true"})

        if job_response.status_code != 200:
            return jsonify({"error": "Failed to fetch job details"}), 500

        job_data = job_response.json()
        job_desc = job_data.get("description")
        requirements = job_data.get("requirements")

        if not job_desc or not requirements:
            return jsonify({"error": "Incomplete job information"}), 500

        # Step 2: Fetch applicants
        applicants_url = f"http://localhost:8000/job/applicants/{job_number}"
        response = requests.get(applicants_url, headers={"x-internal-call": "true"})

        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch applicants"}), 500

        applicants = response.json()
        results = []

        # Step 3: Analyze each resume
        for applicant in applicants:
            resume_url = applicant.get("resumeURL") or applicant.get("resume_url")
            if not resume_url:
                continue

            try:
                resume_text = extract_text_from_pdf(resume_url)
                analysis = analyze_resume(job_desc, requirements, resume_text)

                score = analysis.get("shortlisting_score", 0)
                recommendation = "Select" if score >= 70 else "Do Not Select"

                results.append({
                    "applicant": applicant,
                    "analysis": analysis,
                    "recommendation": recommendation
                })
            except Exception as e:
                results.append({
                    "applicant": applicant,
                    "error": str(e)
                })

        return jsonify({"results": results})

    except Exception as e:
        return jsonify({"error": "Something went wrong", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(port=9000)
