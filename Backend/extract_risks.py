import google.generativeai as genai

# Configure the Gemini API
genai.configure(api_key="AIzaSyCptEb5xHHiEMRlPUV3C4RIN_37Czc_eks")

# Initialize the model
model = genai.GenerativeModel('gemini-pro')

def extract_risks(text):
    try:
        prompt = f"""You are a legal expert. Analyze the following legal clause and identify potential risks. For each risk, provide the term and a brief explanation of why it's risky. Format each risk as "Term: Explanation".

Legal clause:
{text}

Risks:"""

        response = model.generate_content(prompt)
        risks_text = response.text
        
        # Split risks by newline and return as an array
        risks_array = [risk.strip() for risk in risks_text.split('\n') if risk.strip()]
        return risks_array
    except Exception as e:
        return [f"Error extracting risks: {str(e)}"]