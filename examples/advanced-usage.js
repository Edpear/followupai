const { followupai, GROQ_MODELS } = require('../dist/index');

// Advanced example showing multiple features
async function advancedExample() {
  // Initialize with different model
  const followupai = new followupai({
    apiKey: process.env.GROQ_API_KEY || 'your-api-key-here',
    model: 'llama-3.1-70b-version' // Using a different model
  });

  try {
    console.log('🚀 Advanced followupai Example\n');
    
    // Example 1: Generate question with context and difficulty
    console.log('1️⃣ Generating a medium difficulty question with context...\n');
    const question1 = await followupai.generateFollowUpQuestion(
      'React',
      'Focus on hooks and state management',
      'medium'
    );
    
    console.log('📝 Question 1:');
    console.log(question1.question);
    console.log('\nChoices:');
    question1.choices.forEach((choice, index) => {
      console.log(`${String.fromCharCode(65 + index)}. ${choice}`);
    });
    console.log(`Correct: ${question1.correctAnswer}\n`);
    
    // Example 2: Generate multiple questions
    console.log('2️⃣ Generating 3 questions about Machine Learning...\n');
    const questions = await followupai.generateMultipleQuestions(
      'Machine Learning',
      3,
      'Focus on neural networks and deep learning',
      'hard'
    );
    
    questions.forEach((question, index) => {
      console.log(`Question ${index + 1}:`);
      console.log('-'.repeat(40));
      console.log(question.question);
      console.log('\nChoices:');
      question.choices.forEach((choice, choiceIndex) => {
        console.log(`${String.fromCharCode(65 + choiceIndex)}. ${choice}`);
      });
      console.log(`Correct: ${question.correctAnswer}`);
      console.log(`Explanation: ${question.explanation}\n`);
    });
    
    // Example 3: Update configuration
    console.log('3️⃣ Updating configuration to use a different model...\n');
    followupai.updateConfig({ model: 'llama-3.1-8b-instant' });
    console.log('Current config:', followupai.getConfig());
    
    // Example 4: Generate with new model
    console.log('\n4️⃣ Generating a question with the new model...\n');
    const question2 = await followupai.generateFollowUpQuestion('Python', undefined, 'easy');
    
    console.log('📝 Question 2:');
    console.log(question2.question);
    console.log('\nChoices:');
    question2.choices.forEach((choice, index) => {
      console.log(`${String.fromCharCode(65 + index)}. ${choice}`);
    });
    console.log(`Correct: ${question2.correctAnswer}\n`);
    
    // Example 5: Show available models
    console.log('5️⃣ Available Groq Models:');
    GROQ_MODELS.forEach((model, index) => {
      console.log(`${index + 1}. ${model}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure you have:');
    console.log('1. Set your Groq API key in GROQ_API_KEY environment variable');
    console.log('2. Or run "npm run setup" to configure interactively');
  }
}

// Run the advanced example
advancedExample(); 