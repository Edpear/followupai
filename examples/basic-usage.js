const { followupai } = require('../dist/index');

// Example usage of followupai
async function example() {
  // Initialize followupai with your configuration
  const followupai = new followupai({
    apiKey: process.env.GROQ_API_KEY || 'your-api-key-here',
    model: 'llama-3.1-8b-instant'
  });

  try {
    console.log('🤖 Generating a question about JavaScript...\n');
    
    // Generate a single question
    const question = await followupai.generateFollowUpQuestion('JavaScript');
    
    console.log('📝 Generated Question:');
    console.log('='.repeat(50));
    console.log(question.question);
    console.log('\n📋 Choices:');
    question.choices.forEach((choice, index) => {
      console.log(`${String.fromCharCode(65 + index)}. ${choice}`);
    });
    console.log(`\n✅ Correct Answer: ${question.correctAnswer}`);
    console.log(`\n💡 Explanation: ${question.explanation}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure you have:');
    console.log('1. Set your Groq API key in GROQ_API_KEY environment variable');
    console.log('2. Or run "npm run setup" to configure interactively');
  }
}

// Run the example
example(); 