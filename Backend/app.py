from flask import Flask, request, jsonify
from flask_cors import CORS
from pdf_to_text import pdf_to_text
from summarize import summarize_text
from extract_risks import extract_risks
import google.generativeai as genai
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure the Gemini API
genai.configure(api_key="AIzaSyCptEb5xHHiEMRlPUV3C4RIN_37Czc_eks")

# Initialize the model
model = genai.GenerativeModel('gemini-pro')

@app.route('/api/analyze', methods=['POST'])
def analyze_text():
    try:
        data = request.get_json()
        text = data.get('text')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400

        # Get summary and risks
        summary = summarize_text(text)
        risks = extract_risks(text)

        # Format risks into the expected structure
        risky_terms = []
        for risk in risks:
            # Split risk into term and explanation
            parts = risk.split(':', 1)
            if len(parts) == 2:
                term = parts[0].strip()
                explanation = parts[1].strip()
                # Determine severity based on keywords
                severity = "medium"
                if any(word in term.lower() for word in ["critical", "severe", "high"]):
                    severity = "high"
                elif any(word in term.lower() for word in ["minor", "low"]):
                    severity = "low"
                
                risky_terms.append({
                    "term": term,
                    "severity": severity,
                    "explanation": explanation
                })

        response = {
            "simplifiedExplanation": summary,
            "riskyTerms": risky_terms
        }
        
        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/followup', methods=['POST'])
def followup():
    try:
        data = request.get_json()
        question = data.get('question')
        original_text = data.get('originalText')
        
        if not question or not original_text:
            return jsonify({"error": "Question and original text are required"}), 400

        # Generate response using Gemini
        prompt = f"""You are a legal expert assistant. Answer the following question about this legal clause clearly and concisely.

Original text: {original_text}

Question: {question}

Answer:"""

        response = model.generate_content(prompt)
        answer = response.text
        
        return jsonify({"answer": answer})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/extract', methods=['POST'])
def extract():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
            
        file = request.files['file']
        if not file.filename.endswith('.pdf'):
            return jsonify({"error": "Only PDF files are supported"}), 400

        # Extract text from PDF
        text, error = pdf_to_text(file)
        if error:
            return jsonify({"error": error}), 400

        return jsonify({"text": text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 