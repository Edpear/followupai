import axios, { AxiosInstance } from 'axios';
import { FollowUpQuestion, GroqResponse, followupaiConfig } from './types';

export class followupai {
  private client: AxiosInstance;
  private config: followupaiConfig;

  constructor(config: followupaiConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.groq.com/openai/v1',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Generate a follow-up question based on a given topic or context
   */
  async generateFollowUpQuestion(
    topic: string,
    context?: string,
    difficulty?: 'easy' | 'medium' | 'hard'
  ): Promise<FollowUpQuestion> {
    const prompt = this.buildPrompt(topic, context, difficulty);
    
    try {
      const response = await this.client.post<GroqResponse>('/chat/completions', {
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert educator who creates engaging follow-up questions. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content received from Groq API');
      }

      return this.parseResponse(content);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Groq API error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Generate multiple follow-up questions
   */
  async generateMultipleQuestions(
    topic: string,
    count: number = 3,
    context?: string,
    difficulty?: 'easy' | 'medium' | 'hard'
  ): Promise<FollowUpQuestion[]> {
    const questions: FollowUpQuestion[] = [];
    
    for (let i = 0; i < count; i++) {
      try {
        const question = await this.generateFollowUpQuestion(topic, context, difficulty);
        
        // Validate the question has all required fields
        if (!question.question || !question.choices || !question.correctAnswer || !question.explanation) {
          throw new Error('Invalid question format received from API');
        }
        
        // Validate correctAnswer is one of the choices
        if (!question.choices.includes(question.correctAnswer)) {
          throw new Error('Correct answer must be one of the provided choices');
        }
        
        questions.push(question);
      } catch (error) {
        console.warn(`Failed to generate question ${i + 1}:`, error instanceof Error ? error.message : error);
      }
    }

    return questions;
  }

  private buildPrompt(topic: string, context?: string, difficulty?: 'easy' | 'medium' | 'hard'): string {
    const difficultyText = difficulty ? ` with ${difficulty} difficulty` : '';
    const contextText = context ? `\n\nContext: ${context}` : '';
    
    return `Generate a follow-up question about "${topic}"${difficultyText}.${contextText}

Please respond with a JSON object in exactly this format:
{
  "question": "Your question here?",
  "choices": ["Choice A", "Choice B", "Choice C", "Choice D"],
  "correctAnswer": "Choice A",
  "explanation": "Explanation of why this is the correct answer"
}

Requirements:
- The question should be engaging and educational
- Provide exactly 4 multiple choice options
- One option must be clearly correct
- Include a brief explanation of the correct answer
- Make sure the JSON is valid and properly formatted`;
  }

  private parseResponse(content: string): FollowUpQuestion {
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      
      const parsed = JSON.parse(jsonString);
      
      // Validate the structure
      if (!parsed.question || !Array.isArray(parsed.choices) || 
          parsed.choices.length !== 4 || !parsed.correctAnswer || !parsed.explanation) {
        throw new Error('Invalid response structure');
      }

      return {
        question: parsed.question,
        choices: parsed.choices,
        correctAnswer: parsed.correctAnswer,
        explanation: parsed.explanation
      };
    } catch (error) {
      throw new Error(`Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update the configuration
   */
  updateConfig(newConfig: Partial<followupaiConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.apiKey) {
      this.client.defaults.headers['Authorization'] = `Bearer ${newConfig.apiKey}`;
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): followupaiConfig {
    return { ...this.config };
  }
} 