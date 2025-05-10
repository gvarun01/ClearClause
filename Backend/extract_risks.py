import openai
from openai import OpenAI

client = OpenAI(
    api_key="AIzaSyCptEb5xHHiEMRlPUV3C4RIN_37Czc_eks",
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

def extract_risks(text):
    try:
        response = client.chat.completions.create(
            model="gemini-2.0-flash",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": f"Extract risks from the following text: {text}"}
            ]
        )
        risks_text = response.choices[0].message.content
        # Split risks by newline and return as an array
        risks_array = [risk.strip() for risk in risks_text.split('\n') if risk.strip()]
        return risks_array
    except Exception as e:
        return [f"Error: {str(e)}"]