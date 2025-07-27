import React, { useState, useEffect } from 'react';
import { followupai as followupaiClass } from '../followupai';
import { followupaiConfig } from '../types';

interface followupaiChatProps {
  initialTopic?: string;
  initialContext?: string;
  initialDifficulty?: 'easy' | 'medium' | 'hard' | '';
  className?: string;
  style?: React.CSSProperties;
}

export const followupaiChat: React.FC<followupaiChatProps> = ({
  initialTopic = 'JavaScript',
  initialContext = '',
  initialDifficulty = '',
  className = '',
  style = {}
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [context, setContext] = useState(initialContext);
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [questionData, setQuestionData] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [config, setConfig] = useState<followupaiConfig | null>(null);
  
  useEffect(() => {
    // Load config from environment variables
    const envKey = process.env.GROQ_API_KEY;
    const envModel = process.env.followupai_MODEL;
    
    if (envKey && envModel) {
      setConfig({
        apiKey: envKey,
        model: envModel
      });
    } else {
      setError('Missing API configuration. Please set GROQ_API_KEY and followupai_MODEL in your environment variables.');
    }
  }, []);

  const generateQuestion = async () => {
    if (!config) return;
    if (!topic) {
      setError('Please enter a topic');
      return;
    }

    setIsLoading(true);
    setError('');
    setQuestionData(null);
    setSelectedAnswer(null);

    try {
      const followupaiInstance = new followupaiClass(config);
      const question = await followupaiInstance.generateFollowUpQuestion(
        topic,
        context || undefined,
        difficulty || undefined
      );
      setQuestionData(question);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate question');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAnswer = () => {
    if (!selectedAnswer || !questionData) return;
    
    const isCorrect = selectedAnswer === questionData.correctAnswer;
    setQuestionData({
      ...questionData,
      isCorrect,
      checked: true
    });
  };

  return (
    <div className={`followupai-chat ${className}`} style={style}>
      <div className="ef-header">
        <h2>followupai Question Generator</h2>
        <p>Generate AI-powered follow-up questions</p>
      </div>

      {!questionData && (
        <div className="ef-form">
          <div className="ef-form-group">
            <label>Topic</label>
            <input 
              type="text" 
              value={topic} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTopic(e.target.value)}
              placeholder="e.g., JavaScript, Machine Learning"
            />
          </div>

          <div className="ef-form-group">
            <label>Context (Optional)</label>
            <textarea 
              value={context} 
              onChange={(e) => setContext(e.target.value)}
              placeholder="Add any additional context"
              rows={3}
            />
          </div>

          <div className="ef-form-group">
            <label>Difficulty</label>
            <select 
              value={difficulty} 
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDifficulty(e.target.value as '' | 'easy' | 'medium' | 'hard')}
            >
              <option value="">Any difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <button 
            onClick={generateQuestion} 
            disabled={isLoading}
            className="ef-button"
          >
            {isLoading ? 'Generating...' : 'Generate Question'}
          </button>

          {error && !config && <div className="ef-error">{error}</div>}
        </div>
      )}

      {questionData && (
        <div className="ef-question">
          <h3>{questionData.question}</h3>
          
          <div className="ef-choices">
            {questionData.choices.map((choice: string, index: number) => (
              <div 
                key={index}
                className={`ef-choice ${selectedAnswer === choice ? 'selected' : ''} ${questionData.checked ? (choice === questionData.correctAnswer ? 'correct' : selectedAnswer === choice ? 'incorrect' : '') : ''}`}
                onClick={() => !questionData.checked && setSelectedAnswer(choice)}
              >
                <strong>{String.fromCharCode(65 + index)}.</strong> {choice}
              </div>
            ))}
          </div>

          {selectedAnswer && !questionData.checked && (
            <button onClick={checkAnswer} className="ef-button">
              Check Answer
            </button>
          )}

          {questionData.checked && (
            <div className="ef-result">
              <div className={`ef-feedback ${questionData.isCorrect ? 'correct' : 'incorrect'}`}>
                {questionData.isCorrect ? '✅ Correct!' : '❌ Incorrect'}
              </div>
              
              <div className="ef-explanation">
                <strong>Explanation:</strong> {questionData.explanation}
              </div>

              <button 
                onClick={() => setQuestionData(null)} 
                className="ef-button"
              >
                New Question
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Default styles that can be overridden
const defaultStyles = `
.followupai-chat {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.ef-header {
  margin-bottom: 24px;
  text-align: center;
}

.ef-header h2 {
  font-size: 24px;
  margin-bottom: 8px;
}

.ef-form-group {
  margin-bottom: 16px;
}

.ef-form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

input, textarea, select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.ef-button {
  background: #000;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
  margin-top: 16px;
}

.ef-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.ef-error {
  color: #e53e3e;
  margin-top: 16px;
  padding: 12px;
  background: #fff5f5;
  border-radius: 6px;
}

.ef-question h3 {
  font-size: 20px;
  margin-bottom: 16px;
}

.ef-choice {
  padding: 12px;
  margin: 8px 0;
  border: 1px solid #eee;
  border-radius: 6px;
  cursor: pointer;
}

.ef-choice.selected {
  border-color: #000;
  background: #f8f8f8;
}

.ef-choice.correct {
  border-color: #38a169;
  background: #f0fff4;
}

.ef-choice.incorrect {
  border-color: #e53e3e;
  background: #fff5f5;
}

.ef-feedback {
  font-weight: 600;
  margin-bottom: 16px;
}

.ef-feedback.correct {
  color: #38a169;
}

.ef-feedback.incorrect {
  color: #e53e3e;
}
`;

// Inject default styles
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = defaultStyles;
  document.head.appendChild(styleTag);
} 