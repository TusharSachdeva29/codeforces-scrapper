const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function formatMathWithGemini(text) {
  if (!text) return '';
  
  try {
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Given the following JSON representing a Codeforces problem statement, format it into a structured, human-readable format similar to LeetCode's problem page.

Formatting Rules:
Title: Display prominently at the top.
Problem Statement:
Convert plain paragraphs into bullet points for clarity.
Do not change or remove any information. Only restructure for better readability.
Mathematical Expressions:
Convert all mathematical notations into LaTeX format.
Example conversions:
2^30 → $2^{30}$
a<=x<=b → $a \leq x \leq b$ 
Notes Section:
If additional information is provided, include it with proper spacing between different points for clarity.
No Extra Comments:
Do not add phrases like “Here's the LaTeX code” or unnecessary explanations.
Only return the formatted output. 

"AND VERY IMPORTANTLY DONT MISS ANY DETAIL FROM THE PROBLEM STATEMENT"

HERES THE TEXT TO CONVERT: 

${text}`
          }]
        }]
      })
    });

    const data = await response.json();
    console.log('Gemini API Response:', JSON.stringify(data, null, 2));

    // Updated response structure handling
    if (data.error) {
      throw new Error(data.error.message || 'Gemini API error');
    }

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    // Fallback
    console.error('Unexpected Gemini API response format:', data);
    return text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return text;
  }
}
