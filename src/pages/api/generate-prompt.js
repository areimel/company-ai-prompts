import { GoogleGenAI } from '@google/genai';

// API endpoint to generate a prompt using Google's Gemini API
export async function POST({ request }) {
  try {
    // Attempt to read the raw request body
    const rawBody = await request.text();
    console.log("Raw request body length:", rawBody.length);
    console.log("Raw request body (truncated):", rawBody.substring(0, 100) + (rawBody.length > 100 ? "..." : ""));
    
    // Only attempt to parse if we actually have content
    if (!rawBody || rawBody.trim() === "") {
      return new Response(JSON.stringify({
        error: "Empty request body received"
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Parse the JSON body
    let requestData;
    try {
      requestData = JSON.parse(rawBody);
      console.log("Parsed request data:", requestData);
    } catch (error) {
      console.error("JSON parsing error:", error.message);
      return new Response(JSON.stringify({
        error: `Failed to parse request JSON: ${error.message}`
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Extract data from request
    const { model = "gemini-2.0-flash", contents, config } = requestData;
    
    if (!contents) {
      return new Response(JSON.stringify({
        error: "Missing 'contents' field in request"
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    console.log("Using model:", model);
    console.log("User prompt:", contents);
    console.log("Using config:", config);
    
    // Initialize Gemini API with a simpler approach based on documentation
    const genAI = new GoogleGenAI({ apiKey: 'AIzaSyAiN-ESjJzTi8uozCH35livfVSFppCvYCE' });
    
    // Get the generative model
    const genModel = genAI.getGenerativeModel({ model });
    
    // Generate content
    console.log("Sending request to Gemini API...");
    const result = await genModel.generateContent({
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
      systemInstruction: config?.systemInstruction
    });
    
    console.log("Received response from Gemini API");
    const responseText = result.response.text();
    console.log("Generated text (truncated):", responseText.substring(0, 100) + (responseText.length > 100 ? "..." : ""));
    
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