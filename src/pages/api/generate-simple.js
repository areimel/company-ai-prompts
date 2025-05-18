import { GoogleGenAI } from '@google/genai';

// Tell Astro to render this endpoint on-demand (not at build time)
export const prerender = false;

// A dead-simple API endpoint for Gemini
export async function POST({ request }) {
  try {
    // Get the content type
    const contentType = request.headers.get('content-type') || '';
    console.log("Request content type:", contentType);
    
    let promptText = '';
    
    // Handle different content types
    if (contentType.includes('application/x-www-form-urlencoded')) {
      // For application/x-www-form-urlencoded
      const formData = await request.formData();
      promptText = formData.get('prompt') || '';
      console.log("Got prompt from form data:", promptText);
    } else if (contentType.includes('text/plain')) {
      // For text/plain
      promptText = await request.text();
      console.log("Got prompt from plain text:", promptText);
      
      // If the text contains "prompt=" it might be a form submission that didn't set the content type correctly
      if (promptText.startsWith('prompt=')) {
        try {
          promptText = decodeURIComponent(promptText.substring(7));
          console.log("Extracted prompt from text/plain form data:", promptText);
        } catch (e) {
          console.error("Failed to decode prompt from text/plain:", e);
        }
      }
    } else {
      // For any other content type, try to get the raw text
      promptText = await request.text();
      console.log("Got raw text:", promptText);
    }
    
    console.log("Final prompt text (length):", promptText.length);
    if (promptText.length > 0) {
      console.log("Final prompt text (preview):", 
        promptText.substring(0, 100) + (promptText.length > 100 ? "..." : ""));
    }
    
    if (!promptText || promptText.trim() === '') {
      console.error("Empty prompt text received");
      return new Response(JSON.stringify({
        error: "Empty prompt text received"
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Initialize Gemini API - exactly matching the example
    const ai = new GoogleGenAI({ apiKey: 'AIzaSyAiN-ESjJzTi8uozCH35livfVSFppCvYCE' });
    
    // System instruction
    const systemInstruction = "You are a helpful AI assistant that generates creative and useful prompts.";
    
    // Generate content - using the exact pattern from the example
    console.log("Sending request to Gemini API");
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: promptText,
      config: {
        systemInstruction: systemInstruction
      }
    });
    
    // Get the text response directly from the response object
    console.log("Response received from Gemini API");
    
    // Return the generated text
    return new Response(JSON.stringify({
      generatedText: response.text
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