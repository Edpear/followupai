import React, { useState, useEffect } from 'react';
import { followupai } from '../followupai';
import { followupaiConfig } from '../types';

interface SimpleChatProps {
  apiKey?: string;
  model?: string;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

interface QuestionData {
  question: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
  isCorrect?: boolean;
  checked?: boolean;
}

export const SimpleChat: React.FC<SimpleChatProps> = ({
  apiKey,
  model = 'llama-3.1-8b-instant',
  placeholder = 'Ask me anything...',
  className = '',
  style = {}
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{type: 'user' | 'bot', content: string}>>([]);
  const [config, setConfig] = useState<followupaiConfig | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    // Use provided API key or try to get from environment
    const key = apiKey || (typeof window !== 'undefined' ? (window as any).GROQ_API_KEY : undefined);
    const modelFromEnv = typeof window !== 'undefined' ? (window as any).followupai_MODEL : undefined;
    
    // If API key is provided via props, use it
    if (apiKey) {
      setConfig({ 
        apiKey: apiKey, 
        model: model || modelFromEnv || 'llama-3.1-8b-instant' 
      });
    }
    // If no API key provided via props, try to get from environment
    else if (key) {
      setConfig({ 
        apiKey: key, 
        model: model || modelFromEnv || 'llama-3.1-8b-instant' 
      });
    }
    // If no API key available at all, show setup message
    else {
      setMessages([{
        type: 'bot',
        content: `Welcome! Please provide a Groq API key to start generating questions.\n\nYou can:\n1. Pass it as a prop: <QuickChat apiKey="your-key" />\n2. Set it in your .env file and make sure it's available in the browser\n3. Get a free API key from console.groq.com`
      }]);
    }
  }, [apiKey, model]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    if (!config) {
      setMessages(prev => [...prev, { 
        type: 'user', 
        content: input.trim() 
      }, { 
        type: 'bot', 
        content: `Please provide a Groq API key to start generating questions.\n\nYou can:\n1. Pass it as a prop: <QuickChat apiKey="your-key" />\n2. Set it in your .env file and make sure it's available in the browser\n3. Get a free API key from console.groq.com` 
      }]);
      setInput('');
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const followupaiInstance = new followupai(config);
      
      // First, generate an answer to the user's original question
      const answerResponse = await followupaiInstance.generateFollowUpQuestion(
        userMessage,
        undefined,
        undefined
      );
      
      // Extract the answer from the question (we'll use the explanation as the answer)
      const answer = answerResponse.explanation || `Here's information about ${userMessage}`;
      
      // Add the answer to the chat
      setMessages(prev => [...prev, { type: 'bot', content: answer }]);
      
      // Now generate a follow-up question to test understanding
      const followUpQuestion = await followupaiInstance.generateFollowUpQuestion(
        userMessage,
        `Based on the information about ${userMessage}, create a test question to check understanding.`,
        'medium'
      );
      
      // Set the current question for interactive display
      setCurrentQuestion({
        question: followUpQuestion.question,
        choices: followUpQuestion.choices,
        correctAnswer: followUpQuestion.correctAnswer,
        explanation: followUpQuestion.explanation,
        isCorrect: false,
        checked: false
      });
      
      // Clear any previous selection
      setSelectedAnswer(null);
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const checkAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;
    
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setCurrentQuestion({
      ...currentQuestion,
      isCorrect,
      checked: true
    });
  };

  const startNewQuestion = () => {
    setCurrentQuestion(null);
    setSelectedAnswer(null);
  };

  return (
    <div className={`simple-chat ${className}`} style={style}>
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <div className="message-content">{message.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        {/* Interactive Question Display */}
        {currentQuestion && (
          <div className="message bot">
            <div className="message-content question-container">
              <h3 className="question-title">{currentQuestion.question}</h3>
              
              <div className="choices-container">
                {currentQuestion.choices.map((choice, index) => (
                  <div 
                    key={index}
                    className={`choice ${selectedAnswer === choice ? 'selected' : ''} ${currentQuestion.checked ? (choice === currentQuestion.correctAnswer ? 'correct' : selectedAnswer === choice ? 'incorrect' : '') : ''}`}
                    onClick={() => !currentQuestion.checked && setSelectedAnswer(choice)}
                  >
                    <strong>{String.fromCharCode(65 + index)}.</strong> {choice}
                  </div>
                ))}
              </div>

              {selectedAnswer && !currentQuestion.checked && (
                <button onClick={checkAnswer} className="check-button">
                  Check Answer
                </button>
              )}

              {currentQuestion.checked && (
                <div className="result-container">
                  <div className={`feedback ${currentQuestion.isCorrect ? 'correct' : 'incorrect'}`}>
                    {currentQuestion.isCorrect ? '✅ Correct!' : '❌ Incorrect'}
                  </div>
                  
                  <div className="explanation">
                    <strong>Explanation:</strong> {currentQuestion.explanation}
                  </div>

                  <button onClick={startNewQuestion} className="new-question-button">
                    New Question
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="chat-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={!config ? 'Please provide a Groq API key to start chatting...' : placeholder}
          disabled={isLoading}
          rows={1}
          autoFocus={false}
          aria-label="Chat input"
          tabIndex={0}
        />
        <button 
          onClick={sendMessage}
          disabled={isLoading || !input.trim() || !config}
          aria-label="Send message"
          tabIndex={0}
        >
          Send
        </button>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .simple-chat {
            max-width: 600px;
            margin: 0 auto;
            border: 1px solid #e1e5e9;
            border-radius: 12px;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          .chat-messages {
            height: 400px;
            overflow-y: auto;
            padding: 16px;
            background: #f8f9fa;
          }

          .message {
            margin-bottom: 12px;
            display: flex;
          }

          .message.user {
            justify-content: flex-end;
          }

          .message-content {
            max-width: 80%;
            padding: 12px 16px;
            border-radius: 18px;
            white-space: pre-wrap;
            word-wrap: break-word;
          }

          .message.user .message-content {
            background: #007bff;
            color: white;
          }

          .message.bot .message-content {
            background: white;
            color: #333;
            border: 1px solid #e1e5e9;
          }

          .chat-input {
            display: flex;
            padding: 16px;
            background: white;
            border-top: 1px solid #e1e5e9;
          }

          .chat-input textarea {
            flex: 1;
            border: 1px solid #e1e5e9;
            border-radius: 20px;
            padding: 12px 16px;
            margin-right: 8px;
            resize: none;
            font-family: inherit;
            font-size: 14px;
            cursor: text;
            pointer-events: auto;
            user-select: text;
            -webkit-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
          }

          .chat-input textarea:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
          }

          .chat-input textarea:disabled {
            background-color: #f8f9fa;
            color: #6c757d;
            cursor: not-allowed;
          }

          .chat-input button {
            padding: 12px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
          }

          .chat-input button:hover:not(:disabled) {
            background: #0056b3;
          }

          .chat-input button:disabled {
            background: #ccc;
            cursor: not-allowed;
          }

          .typing-indicator {
            display: flex;
            gap: 4px;
            padding: 8px 0;
          }

          .typing-indicator span {
            width: 8px;
            height: 8px;
            background: #999;
            border-radius: 50%;
            animation: typing 1.4s infinite ease-in-out;
          }

          .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
          .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

          @keyframes typing {
            0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
            40% { transform: scale(1); opacity: 1; }
          }

          /* Interactive Question Styles */
          .question-container {
            padding: 0 !important;
            background: white !important;
            border: 1px solid #e1e5e9 !important;
          }

          .question-title {
            margin: 0 0 16px 0;
            padding: 16px 16px 0 16px;
            font-size: 16px;
            font-weight: 600;
            color: #333;
            line-height: 1.4;
          }

          .choices-container {
            padding: 0 16px 16px 16px;
          }

          .choice {
            display: block;
            width: 100%;
            padding: 12px 16px;
            margin-bottom: 8px;
            border: 2px solid #e1e5e9;
            border-radius: 8px;
            background: white;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 14px;
            line-height: 1.4;
            box-sizing: border-box;
          }

          .choice:hover:not(.correct):not(.incorrect) {
            border-color: #007bff;
            background: #f8f9fa;
          }

          .choice.selected {
            border-color: #007bff;
            background: #e3f2fd;
          }

          .choice.correct {
            border-color: #28a745;
            background: #d4edda;
            color: #155724;
          }

          .choice.incorrect {
            border-color: #dc3545;
            background: #f8d7da;
            color: #721c24;
          }

          .check-button {
            display: block;
            width: 100%;
            padding: 12px 16px;
            margin: 0 16px 16px 16px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background 0.2s ease;
            box-sizing: border-box;
          }

          .check-button:hover {
            background: #0056b3;
          }

          .result-container {
            padding: 16px;
            border-top: 1px solid #e1e5e9;
            background: #f8f9fa;
          }

          .feedback {
            padding: 12px 16px;
            margin-bottom: 12px;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
          }

          .feedback.correct {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
          }

          .feedback.incorrect {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
          }

          .explanation {
            margin-bottom: 16px;
            padding: 12px 16px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e1e5e9;
            font-size: 14px;
            line-height: 1.5;
          }

          .new-question-button {
            display: block;
            width: 100%;
            padding: 12px 16px;
            background: #28a745;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background 0.2s ease;
          }

          .new-question-button:hover {
            background: #218838;
          }
        `
      }} />
    </div>
  );
};

// Super simple usage component
export const QuickChat: React.FC<{apiKey?: string}> = ({ apiKey }) => (
  <SimpleChat 
    apiKey={apiKey} 
    placeholder="Ask me to generate a question about any topic..."
  />
); 