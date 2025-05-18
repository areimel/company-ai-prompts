import { GoogleGenAI } from '@google/genai';

// Simple direct API endpoint for Gemini using query parameters
export async function GET({ request, url }) {
  try {
    // Get query parameters from URL
    const query = url.searchParams.get('query') || '';
    console.log("Received query:", query);
    
    if (!query || query.trim() === '') {
      return new Response(JSON.stringify({
        error: "Missing 'query' parameter"
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Initialize Gemini API
    const genAI = new GoogleGenAI({ apiKey: 'AIzaSyAiN-ESjJzTi8uozCH35livfVSFppCvYCE' });
    
    // Get the generative model
    const genModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // System instruction
    const systemInstruction = "You are a helpful AI assistant that generates creative and useful prompts.";
    
    // Generate content
    console.log("Sending request to Gemini API...");
    const result = await genModel.generateContent({
      contents: query,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
      systemInstruction: systemInstruction
    });
    
    console.log("Received response from Gemini API");
    const responseText = result.response.text();
    console.log("Generated text (truncated):", 
      responseText.substring(0, 100) + (responseText.length > 100 ? "..." : ""));
    
    // Return the generated text
    return new Response(JSON.stringify({
      generatedText: responseText
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error generating prompt:', error);
    
    return new Response(JSON.stringify({
      error: `Failed to generate prompt: ${error.message}`
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 