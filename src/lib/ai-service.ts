import { google } from '@ai-sdk/google';
import { generateText, streamText } from 'ai';

// Input validation interface
export interface PromptInput {
  text: string;
  temperature?: number;
  maxTokens?: number;
  systemInstruction?: string;
}

// Response interfaces
export interface PromptResponse {
  success: boolean;
  text?: string;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Configuration constants
const DEFAULT_CONFIG = {
  model: 'gemini-2.0-flash',
  temperature: 0.7,
  maxTokens: 1024,
  systemInstruction: "You are a helpful AI assistant that generates creative and useful prompts. Create detailed, specific, and actionable prompts based on the user's description."
};

// Input validation function
export function validatePromptInput(input: string): ValidationResult {
  if (!input || typeof input !== 'string') {
    return { isValid: false, error: 'Input must be a non-empty string' };
  }

  const trimmed = input.trim();
  
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Input cannot be empty or only whitespace' };
  }
  
  if (trimmed.length < 10) {
    return { isValid: false, error: 'Input must be at least 10 characters long' };
  }
  
  if (trimmed.length > 5000) {
    return { isValid: false, error: 'Input must be less than 5000 characters' };
  }
  
  return { isValid: true };
}

// Sanitize input text
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/\0/g, '') // Remove null bytes
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n');
}

// Get API key with proper error handling
function getApiKey(): string {
  // For client-side usage, we'll use a public environment variable
  // Note: This should be configured to use a server-side proxy in production
  const apiKey = import.meta.env.PUBLIC_GOOGLE_GEMINI_API_KEY || import.meta.env.GOOGLE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Gemini API key is not configured. Please set PUBLIC_GOOGLE_GEMINI_API_KEY in your environment variables.');
  }
  
  return apiKey;
}

// Generate prompt using Vercel AI SDK (non-streaming)
export async function generatePrompt(input: PromptInput): Promise<PromptResponse> {
  try {
    // Validate input
    const validation = validatePromptInput(input.text);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      };
    }

    // Sanitize input
    const sanitizedInput = sanitizeInput(input.text);
    
    // Get API key
    const apiKey = getApiKey();
    
    // Configure the model
    const model = google(DEFAULT_CONFIG.model, {
      apiKey
    });

    // Generate text using AI SDK
    const { text } = await generateText({
      model,
      prompt: sanitizedInput,
      temperature: input.temperature ?? DEFAULT_CONFIG.temperature,
      maxTokens: input.maxTokens ?? DEFAULT_CONFIG.maxTokens,
      system: input.systemInstruction ?? DEFAULT_CONFIG.systemInstruction,
    });

    return {
      success: true,
      text
    };

  } catch (error) {
    console.error('Error generating prompt:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return {
          success: false,
          error: 'API configuration error. Please check your settings.'
        };
      }
      
      if (error.message.includes('quota') || error.message.includes('limit')) {
        return {
          success: false,
          error: 'API quota exceeded. Please try again later.'
        };
      }
      
      return {
        success: false,
        error: `Generation failed: ${error.message}`
      };
    }
    
    return {
      success: false,
      error: 'An unexpected error occurred while generating the prompt'
    };
  }
}

// Stream prompt generation for real-time updates
export async function streamPromptGeneration(input: PromptInput) {
  // Validate input
  const validation = validatePromptInput(input.text);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Sanitize input
  const sanitizedInput = sanitizeInput(input.text);
  
  // Get API key
  const apiKey = getApiKey();
  
  // Configure the model
  const model = google(DEFAULT_CONFIG.model, {
    apiKey
  });

  // Return the stream from AI SDK
  return await streamText({
    model,
    prompt: sanitizedInput,
    temperature: input.temperature ?? DEFAULT_CONFIG.temperature,
    maxTokens: input.maxTokens ?? DEFAULT_CONFIG.maxTokens,
    system: input.systemInstruction ?? DEFAULT_CONFIG.systemInstruction,
  });
}

// Predefined system instructions for different prompt types
export const PROMPT_TYPES = {
  creative: "You are a creative writing assistant that generates imaginative and inspiring prompts for creative projects, storytelling, and artistic endeavors. Focus on creativity, originality, and artistic expression.",
  business: "You are a business strategy assistant that generates practical and strategic prompts for business planning, marketing, operations, and professional development. Focus on actionable insights and measurable outcomes.",
  technical: "You are a technical assistant that generates precise and detailed prompts for coding, engineering, and technical problem-solving. Focus on accuracy, best practices, and practical implementation.",
  educational: "You are an educational assistant that generates structured and pedagogical prompts for learning, teaching, and knowledge development. Focus on clear learning objectives and progressive skill building.",
  general: DEFAULT_CONFIG.systemInstruction
} as const;

export type PromptType = keyof typeof PROMPT_TYPES;

// Helper function to generate prompt with specific type
export async function generatePromptByType(
  input: string, 
  type: PromptType = 'general',
  options?: Partial<PromptInput>
): Promise<PromptResponse> {
  return generatePrompt({
    text: input,
    systemInstruction: PROMPT_TYPES[type],
    ...options
  });
}