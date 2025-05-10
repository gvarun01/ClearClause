from flask import Flask, request, jsonify
from input import get_input
from pdf_to_text import pdf_to_text
from summarize import summarize_text
from extract_risks import extract_risks
import os

app = Flask(__name__)

@app.route('/process', methods=['POST'])
def process_input():
    text, error = get_input()
    if error:
        return jsonify({"error": error}), 400

    # If the input is a PDF file, convert it to text
    if 'file' in request.files and request.files['file'].filename.endswith('.pdf'):
        text, error = pdf_to_text(request.files['file'])
        if error:
            return jsonify({"error": error}), 400

    # Summarize the text
    summary = summarize_text(text)
    # print("summary is ",summary)
    risks = extract_risks(text)
    print("risks are ",risks)

    return jsonify({"summary": summary, "risks": risks})

if __name__ == '__main__':
    app.run(debug=True)