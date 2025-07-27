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
  .description('Generate follow-up questions using Groq API')
  .version('1.0.0');

// Setup command
program
  .command('setup')
  .description('Interactive setup for API key and configuration')
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
  .description('Generate a follow-up question')
  .argument('<topic>', 'Topic for the question')
  .option('-c, --context <context>', 'Additional context for the question')
  .option('-d, --difficulty <difficulty>', 'Difficulty level (easy, medium, hard)')
  .option('-m, --model <model>', 'Groq model to use')
  .option('-k, --key <key>', 'Groq API key')
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
  .description('Generate multiple follow-up questions')
  .argument('<topic>', 'Topic for the questions')
  .argument('[count]', 'Number of questions to generate', '3')
  .option('-c, --context <context>', 'Additional context for the questions')
  .option('-d, --difficulty <difficulty>', 'Difficulty level (easy, medium, hard)')
  .option('-m, --model <model>', 'Groq model to use')
  .option('-k, --key <key>', 'Groq API key')
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
  .description('Start the demo server')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
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
  .description('Show current configuration')
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