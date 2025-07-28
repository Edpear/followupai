#!/usr/bin/env node

import { Command } from 'commander';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { followupai } from './followupai';
import { runSetup } from './setup';
import { followupaiConfig, GroqModel, FollowUpQuestion } from './types';

// Load environment variables
dotenv.config();

// Ensure GeneratedQuestions directory exists
const generatedQuestionsDir = path.join(process.cwd(), 'GeneratedQuestions');
if (!fs.existsSync(generatedQuestionsDir)) {
  fs.mkdirSync(generatedQuestionsDir);
}

const program = new Command();

program
  .name('followupai')
  .description('AI-powered question generator - Create interactive chatbots and learning experiences with just one line of code')
  .version('1.0.0')
  .addHelpText('after', `

Examples:
  $ followupai setup                    # Interactive setup for API key
  $ followupai generate "JavaScript"    # Generate a question about JavaScript
  $ followupai generate-multiple "React" 5  # Generate 5 React questions
  $ followupai demo                     # Start interactive demo server
  $ followupai config                   # Show current configuration

Quick Start:
  1. Run 'followupai setup' to configure your Groq API key
  2. Run 'followupai generate "your topic"' to create questions
  3. Run 'followupai demo' to see the interactive demo

For more information, visit: https://github.com/Edpear/followupai`);

// Setup command
program
  .command('setup')
  .description('Interactive setup wizard to configure your Groq API key and model preferences')
  .action(async () => {
    try {
      await runSetup();
    } catch (error) {
      console.error('Setup failed:', error);
      process.exit(1);
    }
  });

// Generate command
program
  .command('generate')
  .description('Generate a single interactive question with multiple choice answers and explanations')
  .argument('<topic>', 'The topic or subject for the question (e.g., "JavaScript", "React hooks", "Python functions")')
  .option('-c, --context <context>', 'Additional context or background information for the question')
  .option('-d, --difficulty <difficulty>', 'Difficulty level: easy, medium, or hard (default: medium)')
  .option('-m, --model <model>', 'Groq model to use (default: llama3-8b-8192)')
  .option('-k, --key <key>', 'Groq API key (overrides environment variable)')
  .action(async (topic: string, options: any) => {
    try {
      const config = await getConfig(options);
      if (!config) {
        console.error('❌ No configuration found. Please run "followupai setup" first.');
        process.exit(1);
      }

      const followupaiInstance = new followupai(config);
      console.log(`🤖 Generating question about "${topic}"...`);
      
      const question = await followupaiInstance.generateFollowUpQuestion(
        topic,
        options.context,
        options.difficulty
      );

      console.log('\n📝 Generated Question:');
      console.log('='.repeat(50));
      console.log(question.question);
      console.log('\n📋 Choices:');
      question.choices.forEach((choice: string, index: number) => {
        console.log(`${String.fromCharCode(65 + index)}. ${choice}`);
      });
      console.log(`\n✅ Correct Answer: ${question.correctAnswer}`);
      console.log(`\n💡 Explanation: ${question.explanation}`);
      
    } catch (error) {
      console.error('❌ Error generating question:', error);
      process.exit(1);
    }
  });

// Generate multiple questions
program
  .command('generate-multiple')
  .description('Generate multiple questions and save them as JSON files in the GeneratedQuestions folder')
  .argument('<topic>', 'The topic or subject for the questions (e.g., "JavaScript", "React hooks", "Python functions")')
  .argument('[count]', 'Number of questions to generate (default: 3)', '3')
  .option('-c, --context <context>', 'Additional context or background information for the questions')
  .option('-d, --difficulty <difficulty>', 'Difficulty level: easy, medium, or hard (default: medium)')
  .option('-m, --model <model>', 'Groq model to use (default: llama3-8b-8192)')
  .option('-k, --key <key>', 'Groq API key (overrides environment variable)')
  .action(async (topic: string, count: string, options: any) => {
    try {
      const config = await getConfig(options);
      if (!config) {
        console.error('❌ No configuration found. Please run "followupai setup" first.');
        process.exit(1);
      }

      const questionCount = parseInt(count, 10);
      
      console.log(`🤖 Generating ${questionCount} questions about "${topic}"...`);
      
      const questions = await generateQuestions(config, topic, questionCount, options.context, options.difficulty);

      console.log(`\n✅ Generated ${questions.length} questions:\n`);
      
      questions.forEach((question: FollowUpQuestion, index: number) => {
        console.log(`Question ${index + 1}:`);
        console.log('-'.repeat(30));
        console.log(question.question);
        console.log('\nChoices:');
        question.choices.forEach((choice: string, choiceIndex: number) => {
          console.log(`${String.fromCharCode(65 + choiceIndex)}. ${choice}`);
        });
        console.log(`Correct: ${question.correctAnswer}`);
        console.log(`Explanation: ${question.explanation}`);
        console.log('\n');
      });
      
    } catch (error) {
      console.error('❌ Error generating questions:', error);
      process.exit(1);
    }
  });

// Demo command
program
  .command('demo')
  .description('Start an interactive web demo server to test the chatbot features')
  .option('-p, --port <port>', 'Port to run the demo server on (default: 3000)', '3000')
  .action(async (options) => {
    try {
      console.log('🚀 Starting followupai Demo Server...');
      
      // Start the demo server directly
      const demoServer = await import('./demo-server');
      // The demo server starts automatically when imported
      
    } catch (error) {
      console.error('❌ Error starting demo server:', error);
      process.exit(1);
    }
  });

// Config command
program
  .command('config')
  .description('Display current API key and model configuration')
  .action(() => {
    const config = getConfigFromFiles();
    if (config) {
      console.log('📋 Current Configuration:');
      console.log(`API Key: ${config.apiKey.substring(0, 8)}...`);
      console.log(`Model: ${config.model}`);
    } else {
      console.log('❌ No configuration found. Run "followupai setup" to configure.');
    }
  });

// Help command with detailed information
program
  .command('help')
  .description('Show detailed help information and usage examples')
  .action(() => {
    console.log(`
🤖 followupai - AI-Powered Question Generator
==============================================

Create interactive chatbots and learning experiences with just one line of code!

📋 Available Commands:
====================

  setup                    Interactive setup wizard for API key and model
  generate <topic>         Generate a single interactive question
  generate-multiple <topic> [count]  Generate multiple questions and save as JSON
  demo                     Start interactive web demo server
  config                   Display current configuration
  help                     Show this detailed help information

📖 Detailed Usage:
=================

1. SETUP (First Time):
   $ followupai setup
   • Interactive wizard to configure your Groq API key
   • Creates .env file with your settings
   • Sets default model preferences

2. GENERATE SINGLE QUESTION:
   $ followupai generate "JavaScript"
   $ followupai generate "React hooks" -d hard -c "Focus on useState and useEffect"
   
   Options:
   -c, --context <text>    Additional context for the question
   -d, --difficulty <level> Difficulty: easy, medium, hard
   -m, --model <model>     Groq model (default: llama3-8b-8192)
   -k, --key <key>         API key (overrides .env)

3. GENERATE MULTIPLE QUESTIONS:
   $ followupai generate-multiple "Python" 5
   $ followupai generate-multiple "React" 10 -d easy
   
   • Saves questions as JSON files in GeneratedQuestions/ folder
   • Each file contains question, choices, correct answer, and explanation

4. DEMO SERVER:
   $ followupai demo
   $ followupai demo -p 8080
   
   • Starts web server with interactive chatbot
   • Test all features in your browser
   • Default port: 3000

5. CONFIGURATION:
   $ followupai config
   
   • Shows current API key (masked) and model
   • Helps verify your setup

🔧 Integration Examples:
======================

React Component Usage:
  import { QuickChat } from 'followupai';
  
  function App() {
    return <QuickChat apiKey="your-key" />;
  }

Node.js Usage:
  const { followupai } = require('followupai');
  const ai = new followupai({ apiKey: 'your-key' });
  const question = await ai.generateFollowUpQuestion('JavaScript');

📁 File Structure:
=================
  GeneratedQuestions/     # Saved question JSON files
  .env                   # Environment variables (created by setup)
  followupai.config.json # Configuration file (optional)

🔗 Resources:
============
  • GitHub: https://github.com/Edpear/followupai
  • Groq API: https://console.groq.com
  • Documentation: See README.md

💡 Tips:
========
  • Use quotes around topics with spaces: "React hooks"
  • Questions are saved automatically with timestamps
  • Demo server is perfect for testing before integration
  • All commands support --help for detailed options

Need more help? Visit: https://github.com/Edpear/followupai
`);
  });

// Helper function to get configuration
async function getConfig(options: any) {
  // Priority: command line options > environment variables > config file
  if (options.key && options.model) {
    return { apiKey: options.key, model: options.model };
  }

  const config = getConfigFromFiles();
  if (!config) {
    return null;
  }

  // Override with command line options if provided
  if (options.model) {
    config.model = options.model;
  }
  if (options.key) {
    config.apiKey = options.key;
  }

  return config;
}

async function generateQuestions(config: followupaiConfig, topic: string, count: number, context?: string, difficulty?: string) {
  const followupaiInstance = new followupai(config);
  
  try {
    const questions = await followupaiInstance.generateMultipleQuestions(topic, count, context, difficulty as any);
    
    // Save each question to a file
    questions.forEach((question: FollowUpQuestion, index: number) => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `question-${timestamp}-${index}.json`;
      const filePath = path.join(generatedQuestionsDir, filename);
      
      fs.writeFileSync(filePath, JSON.stringify(question, null, 2));
      console.log(`Question saved to: ${filePath}`);
    });
    
    return questions;
  } catch (error) {
    console.error('Error generating questions:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function getConfigFromFiles() {
  // Check environment variables
  const envKey = process.env.GROQ_API_KEY;
  const envModel = process.env.followupai_MODEL;
  
  if (envKey && envModel) {
    return { apiKey: envKey, model: envModel };
  }

  // Check config file
  const configPath = path.join(process.cwd(), 'followupai.config.json');
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return { apiKey: config.apiKey, model: config.model };
    } catch (error) {
      console.error('Error reading config file:', error);
    }
  }

  return null;
}

// Parse command line arguments
program.parse(); 