import openai
from openai import OpenAI

client = OpenAI(
    api_key="AIzaSyCptEb5xHHiEMRlPUV3C4RIN_37Czc_eks",
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

def summarize_text(text):
    try:
        response = client.chat.completions.create(
            model="gemini-2.0-flash",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": f"Summarise the following text: {text}"}
            ]
        )
        
        print('output is ',response.choices[0].message.content)
        response_text = response.choices[0].message.content
        return response_text
    except Exception as e:
        return f"Error: {str(e)}"