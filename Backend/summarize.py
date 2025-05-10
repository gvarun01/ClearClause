import google.generativeai as genai

# Configure the Gemini API
genai.configure(api_key="AIzaSyCptEb5xHHiEMRlPUV3C4RIN_37Czc_eks")

# Initialize the model
model = genai.GenerativeModel('gemini-pro')

def summarize_text(text):
    try:
        prompt = f"""You are a legal expert. Please provide a clear and concise explanation of the following legal clause in simple terms that a non-lawyer can understand:

{text}

Explanation:"""

        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating summary: {str(e)}"