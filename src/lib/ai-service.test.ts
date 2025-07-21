import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validatePromptInput, sanitizeInput, generatePrompt, PROMPT_TYPES } from './ai-service';

// Mock the AI SDK
vi.mock('ai', () => ({
  generateText: vi.fn()
}));

vi.mock('@ai-sdk/google', () => ({
  google: vi.fn(() => ({ mockModel: true }))
}));

describe('AI Service', () => {
  describe('validatePromptInput', () => {
    it('should reject empty or null inputs', () => {
      expect(validatePromptInput('')).toEqual({
        isValid: false,
        error: 'Input must be a non-empty string'
      });
      
      expect(validatePromptInput('   ')).toEqual({
        isValid: false,
        error: 'Input cannot be empty or only whitespace'
      });
      
      // @ts-ignore - testing invalid input type
      expect(validatePromptInput(null)).toEqual({
        isValid: false,
        error: 'Input must be a non-empty string'
      });
    });

    it('should reject inputs that are too short', () => {
      expect(validatePromptInput('short')).toEqual({
        isValid: false,
        error: 'Input must be at least 10 characters long'
      });
    });

    it('should reject inputs that are too long', () => {
      const longInput = 'a'.repeat(5001);
      expect(validatePromptInput(longInput)).toEqual({
        isValid: false,
        error: 'Input must be less than 5000 characters'
      });
    });

    it('should accept valid inputs', () => {
      expect(validatePromptInput('This is a valid input that is long enough')).toEqual({
        isValid: true
      });
    });

    it('should handle edge cases at boundaries', () => {
      // Exactly 10 characters
      expect(validatePromptInput('1234567890')).toEqual({
        isValid: true
      });

      // Exactly 5000 characters
      const maxLengthInput = 'a'.repeat(5000);
      expect(validatePromptInput(maxLengthInput)).toEqual({
        isValid: true
      });

      // 9 characters (just under minimum)
      expect(validatePromptInput('123456789')).toEqual({
        isValid: false,
        error: 'Input must be at least 10 characters long'
      });
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello world  ')).toBe('hello world');
    });

    it('should remove null bytes', () => {
      const input = 'hello\u0000world';
      expect(sanitizeInput(input)).toBe('helloworld');
    });

    it('should normalize line endings', () => {
      expect(sanitizeInput('line1\r\nline2\rline3')).toBe('line1\nline2\nline3');
    });

    it('should handle complex mixed input', () => {
      const input = '  \r\nHello World\r\n  ';
      expect(sanitizeInput(input)).toBe('Hello World');
    });
  });

  describe('generatePrompt', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      // Mock environment variable
      vi.stubEnv('PUBLIC_GOOGLE_GEMINI_API_KEY', 'test-api-key');
    });

    it('should reject invalid inputs', async () => {
      const result = await generatePrompt({ text: 'short' });
      
      expect(result).toEqual({
        success: false,
        error: 'Input must be at least 10 characters long'
      });
    });

    it('should handle missing API key', async () => {
      vi.unstubAllEnvs();
      
      const result = await generatePrompt({ 
        text: 'This is a valid input that is long enough' 
      });
      
      expect(result).toEqual({
        success: false,
        error: 'API configuration error. Please check your settings.'
      });
    });
  });

  describe('PROMPT_TYPES', () => {
    it('should contain all expected prompt types', () => {
      expect(PROMPT_TYPES).toHaveProperty('creative');
      expect(PROMPT_TYPES).toHaveProperty('business');
      expect(PROMPT_TYPES).toHaveProperty('technical');
      expect(PROMPT_TYPES).toHaveProperty('educational');
      expect(PROMPT_TYPES).toHaveProperty('general');
    });

    it('should have non-empty system instructions', () => {
      Object.values(PROMPT_TYPES).forEach(instruction => {
        expect(instruction).toBeTruthy();
        expect(typeof instruction).toBe('string');
        expect(instruction.length).toBeGreaterThan(10);
      });
    });
  });

  describe('Input edge cases and security', () => {
    it('should handle various input types safely', () => {
      // Test with special characters
      const specialChars = 'Test with special chars: <>&"';
      expect(validatePromptInput(specialChars)).toEqual({ isValid: true });
      
      // Test with Unicode
      const unicode = 'Test with unicode: hello world';
      expect(validatePromptInput(unicode)).toEqual({ isValid: true });
      
      // Test with HTML/JS-like content (should not be filtered by validation)
      const htmlLike = '<script>alert("test")</script> this is a valid long prompt';
      expect(validatePromptInput(htmlLike)).toEqual({ isValid: true });
    });

    it('should sanitize potentially harmful input', () => {
      const maliciousInput = '  <script>alert("xss")</script>\u0000\r\n  ';
      const sanitized = sanitizeInput(maliciousInput);
      
      // Should remove null bytes and normalize line endings, but preserve other content
      expect(sanitized).toBe('<script>alert("xss")</script>');
      expect(sanitized).not.toContain('\u0000');
    });
  });
});