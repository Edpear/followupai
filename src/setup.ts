import * as fs from 'fs';
import * as path from 'path';
import inquirer from 'inquirer';
import { GROQ_MODELS } from './types';

export async function runSetup(): Promise<void> {
  console.log('🚀 Welcome to followupai Setup!');
  console.log('This will help you configure your Groq API key and create a demo page.\n');

  // Check for existing .env file
  const envPath = path.join(process.cwd(), '.env');
  const envExists = fs.existsSync(envPath);
  
  let apiKey = '';
  let model = '';

  if (envExists) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const apiKeyMatch = envContent.match(/GROQ_API_KEY=(.+)/);
    if (apiKeyMatch) {
      apiKey = apiKeyMatch[1];
      console.log('✅ Found existing API key in .env file');
    }
  }

  // Ask for API key
  if (!apiKey) {
    const { hasKey } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'hasKey',
        message: 'Do you have a Groq API key?',
        default: false
      }
    ]);

    if (!hasKey) {
      console.log('\n📋 To get a Groq API key:');
      console.log('1. Go to https://console.groq.com/');
      console.log('2. Sign up or log in to your account');
      console.log('3. Navigate to API Keys section');
      console.log('4. Create a new API key');
      console.log('5. Copy the key and return here\n');
      
      const { shouldContinue } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldContinue',
          message: 'Have you created an API key and are ready to continue?',
          default: false
        }
      ]);

      if (!shouldContinue) {
        console.log('Setup cancelled. You can run this again later.');
        process.exit(0);
      }
    }

    const { key } = await inquirer.prompt([
      {
        type: 'password',
        name: 'key',
        message: 'Please enter your Groq API key:',
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'API key is required';
          }
          if (!input.startsWith('gsk_')) {
            return 'API key should start with "gsk_"';
          }
          return true;
        }
      }
    ]);

    apiKey = key;
  }

  // Ask for model selection
  const { selectedModel } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedModel',
      message: 'Which Groq model would you like to use?',
      choices: GROQ_MODELS.map(model => ({
        name: `${model} ${getModelDescription(model)}`,
        value: model
      })),
      default: 'llama-3.1-8b-instant'
    }
  ]);

  model = selectedModel;

  // Ask about demo page
  const { createDemo } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'createDemo',
      message: 'Do you want to generate a demo page (/followupaidemo)?',
      default: true
    }
  ]);

  // Save configuration
  await saveConfiguration(apiKey, model);

  if (createDemo) {
    await createDemoPage();
  }

  console.log('\n✅ Setup complete!');
  console.log(`📝 API Key: ${apiKey.substring(0, 8)}...`);
  console.log(`🤖 Model: ${model}`);
  
  if (createDemo) {
    console.log('🌐 Demo page will be available at http://localhost:3000/followupaidemo');
    console.log('💡 Run "npm run demo" to start the demo server');
  }
  
  console.log('\n🚀 You can now use followupai in your projects!');
}

function getModelDescription(model: string): string {
  const descriptions: Record<string, string> = {
    'llama-3.1-8b-instant': '(Fastest, good for simple tasks)',
    'llama-3.1-70b-version': '(Balanced speed and quality)',
    'llama-3.1-405b-reasoning': '(Best reasoning, slower)',
    'llama-3.1-1b-omni': '(Very fast, basic tasks)',
    'mixtral-8x7b-32768': '(Good for long context)',
    'gemma-7b-it': '(Google\'s model, good quality)',
    'llama-2-70b-4096': '(Stable, reliable)'
  };
  return descriptions[model] || '';
}

async function saveConfiguration(apiKey: string, model: string): Promise<void> {
  const envPath = path.join(process.cwd(), '.env');
  const envContent = `GROQ_API_KEY=${apiKey}
followupai_MODEL=${model}
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Configuration saved to .env file');

  // Also save to a config file for the package
  const configPath = path.join(process.cwd(), 'followupai.config.json');
  const configContent = {
    apiKey,
    model,
    createdAt: new Date().toISOString()
  };

  fs.writeFileSync(configPath, JSON.stringify(configContent, null, 2));
  console.log('✅ Configuration saved to followupai.config.json');
}

async function createDemoPage(): Promise<void> {
  const demoDir = path.join(process.cwd(), 'demo');
  
  if (!fs.existsSync(demoDir)) {
    fs.mkdirSync(demoDir, { recursive: true });
  }

  // Create demo HTML file
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>followupai Demo</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 40px;
            max-width: 600px;
            width: 100%;
        }

        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
            font-size: 2.5em;
            font-weight: 700;
        }

        .input-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: 600;
        }

        input, select, textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            font-size: 16px;
            transition: border-color 0.3s ease;
        }

        input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #667eea;
        }

        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease;
            width: 100%;
        }

        button:hover {
            transform: translateY(-2px);
        }

        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        .result {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }

        .question {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin-bottom: 15px;
        }

        .choices {
            margin-bottom: 15px;
        }

        .choice {
            padding: 10px;
            margin: 5px 0;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }

        .choice:hover {
            background: #e3f2fd;
        }

        .choice.correct {
            background: #c8e6c9;
            border-left: 4px solid #4caf50;
        }

        .choice.incorrect {
            background: #ffcdd2;
            border-left: 4px solid #f44336;
        }

        .choice.selected {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
        }

        .explanation {
            margin-top: 15px;
            padding: 15px;
            background: white;
            border-radius: 8px;
            border-left: 4px solid #ff9800;
        }

        .show-explanation-btn {
            background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
            margin-top: 15px;
            width: auto;
            padding: 10px 20px;
        }

        .result-msg {
            margin-top: 15px;
            padding: 10px;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
        }

        .result-msg.correct {
            background: #c8e6c9;
            color: #2e7d32;
            border: 1px solid #4caf50;
        }

        .result-msg.incorrect {
            background: #ffcdd2;
            color: #c62828;
            border: 1px solid #f44336;
        }

        .loading {
            text-align: center;
            color: #666;
            font-style: italic;
        }

        .error {
            color: #f44336;
            background: #ffebee;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 followupai Demo</h1>
        
        <div class="input-group">
            <label for="topic">Topic:</label>
            <input type="text" id="topic" placeholder="e.g., JavaScript, Machine Learning, History..." value="JavaScript">
        </div>

        <div class="input-group">
            <label for="context">Context (optional):</label>
            <textarea id="context" rows="3" placeholder="Add any additional context or specific focus areas..."></textarea>
        </div>

        <div class="input-group">
            <label for="difficulty">Difficulty:</label>
            <select id="difficulty">
                <option value="">Any difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
            </select>
        </div>

        <button onclick="generateQuestion()" id="generateBtn">Generate Question</button>

        <div id="result"></div>
    </div>

    <script>
        let selectedAnswer = null;
        let answered = false;

        async function generateQuestion() {
            const topic = document.getElementById('topic').value.trim();
            const context = document.getElementById('context').value.trim();
            const difficulty = document.getElementById('difficulty').value;
            const resultDiv = document.getElementById('result');
            const generateBtn = document.getElementById('generateBtn');

            if (!topic) {
                alert('Please enter a topic');
                return;
            }

            generateBtn.disabled = true;
            generateBtn.textContent = 'Generating...';
            resultDiv.innerHTML = '<div class="loading">Generating your question...</div>';

            try {
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        topic,
                        context: context || undefined,
                        difficulty: difficulty || undefined
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to generate question');
                }

                const data = await response.json();
                displayQuestion(data);
            } catch (error) {
                resultDiv.innerHTML = '<div class="error">Error generating question: ' + error.message + '</div>';
            } finally {
                generateBtn.disabled = false;
                generateBtn.textContent = 'Generate Question';
            }
        }

        function displayQuestion(questionData) {
            const resultDiv = document.getElementById('result');
            selectedAnswer = null;
            answered = false;

            const html = \`
                <div class="result">
                    <div class="question">\${questionData.question}</div>
                    <div class="choices">
                        \${questionData.choices.map((choice, index) => \`
                            <div class="choice" onclick="selectAnswer('\${choice}')">
                                <strong>\${String.fromCharCode(65 + index)}.</strong> \${choice}
                            </div>
                        \`).join('')}
                    </div>
                    <button onclick="checkAnswer()" id="checkBtn" style="display: none;">Submit Answer</button>
                    <div id="resultMsg" style="display: none;"></div>
                    <button onclick="showExplanation()" id="showExplanationBtn" style="display: none;" class="show-explanation-btn">Show Explanation</button>
                    <div id="explanation" style="display: none;"></div>
                </div>
            \`;

            resultDiv.innerHTML = html;
        }

        function selectAnswer(answer) {
            if (answered) return; // Don't allow selection after answering
            
            selectedAnswer = answer;
            
            // Remove previous selections
            document.querySelectorAll('.choice').forEach(choice => {
                choice.classList.remove('selected');
            });
            
            // Highlight selected answer
            event.target.classList.add('selected');
            
            // Show submit button
            document.getElementById('checkBtn').style.display = 'block';
        }

        function checkAnswer() {
            if (!selectedAnswer || answered) return;

            answered = true;
            const isCorrect = selectedAnswer === questionData.correctAnswer;
            
            // Disable choice selection
            document.querySelectorAll('.choice').forEach(choice => {
                choice.style.cursor = 'default';
                choice.onclick = null;
            });
            
            // Highlight correct and incorrect answers
            const choices = document.querySelectorAll('.choice');
            choices.forEach(choice => {
                const choiceText = choice.textContent.replace(/^[A-Z]\.\s*/, '');
                if (choiceText === questionData.correctAnswer) {
                    choice.classList.add('correct');
                } else if (choiceText === selectedAnswer && selectedAnswer !== questionData.correctAnswer) {
                    choice.classList.add('incorrect');
                }
            });

            // Show result message
            const resultMsgDiv = document.getElementById('resultMsg');
            resultMsgDiv.innerHTML = \`
                <div class="result-msg \${isCorrect ? 'correct' : 'incorrect'}">
                    \${isCorrect ? '✅ Correct!' : '❌ Incorrect!'}
                </div>
            \`;
            resultMsgDiv.style.display = 'block';
            
            // Hide submit button and show explanation button
            document.getElementById('checkBtn').style.display = 'none';
            document.getElementById('showExplanationBtn').style.display = 'block';
            
            // If answer is incorrect, show explanation automatically
            if (!isCorrect) {
                showExplanation();
            }
        }

        function showExplanation() {
            const explanationDiv = document.getElementById('explanation');
            explanationDiv.innerHTML = \`
                <div class="explanation">
                    <strong>Explanation:</strong> \${questionData.explanation}
                </div>
            \`;
            explanationDiv.style.display = 'block';
            
            // Hide the show explanation button
            document.getElementById('showExplanationBtn').style.display = 'none';
        }

        // Store question data globally for answer checking
        let questionData = null;

        // Override displayQuestion to store data
        const originalDisplayQuestion = displayQuestion;
        displayQuestion = function(data) {
            questionData = data;
            originalDisplayQuestion(data);
        };
    </script>
</body>
</html>`;

  fs.writeFileSync(path.join(demoDir, 'index.html'), htmlContent);
  console.log('✅ Demo page created at demo/index.html');
}

if (require.main === module) {
  runSetup().catch(console.error);
} 