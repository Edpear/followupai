import { followupai } from './followupai';
import { FollowUpQuestion } from './types';

// Mock axios for testing
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: jest.fn()
  })),
  isAxiosError: jest.fn()
}));

describe('followupai', () => {
  let followupaiInstance: followupai;
  const mockConfig = {
    apiKey: 'test-api-key',
    model: 'llama-3.1-8b-instant'
  };

  beforeEach(() => {
    followupaiInstance = new followupai(mockConfig);
  });

  describe('constructor', () => {
    it('should create an instance with the provided config', () => {
      expect(followupaiInstance).toBeInstanceOf(followupai);
      expect(followupaiInstance.getConfig()).toEqual(mockConfig);
    });
  });

  describe('updateConfig', () => {
    it('should update the configuration', () => {
      const newConfig = { model: 'llama-3.1-70b-version' };
      followupaiInstance.updateConfig(newConfig);
      
      expect(followupaiInstance.getConfig()).toEqual({
        ...mockConfig,
        ...newConfig
      });
    });
  });

  describe('getConfig', () => {
    it('should return a copy of the current configuration', () => {
      const config = followupaiInstance.getConfig();
      expect(config).toEqual(mockConfig);
      expect(config).not.toBe(mockConfig); // Should be a copy
    });
  });

  describe('generateFollowUpQuestion', () => {
    it('should throw an error when API is not available', async () => {
      await expect(
        followupaiInstance.generateFollowUpQuestion('test topic')
      ).rejects.toThrow();
    });
  });

  describe('generateMultipleQuestions', () => {
    it('should return an empty array when API is not available', async () => {
      const questions = await followupaiInstance.generateMultipleQuestions('test topic', 3);
      expect(questions).toEqual([]);
    });
  });
});

// Test the FollowUpQuestion interface
describe('FollowUpQuestion Interface', () => {
  it('should have the correct structure', () => {
    const question: FollowUpQuestion = {
      question: 'What is JavaScript?',
      choices: ['A programming language', 'A markup language', 'A styling language', 'A database'],
      correctAnswer: 'A programming language',
      explanation: 'JavaScript is a programming language used for web development.'
    };

    expect(question.question).toBeDefined();
    expect(question.choices).toHaveLength(4);
    expect(question.correctAnswer).toBeDefined();
    expect(question.explanation).toBeDefined();
  });
}); 