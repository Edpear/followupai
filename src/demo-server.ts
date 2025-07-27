import express from 'express';
import cors from 'cors';
import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';
import { followupai as followupaiClass } from './followupai';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../demo')));

// Ensure GeneratedQuestions directory exists
const generatedQuestionsDir = path.join(process.cwd(), 'GeneratedQuestions');
if (!fs.existsSync(generatedQuestionsDir)) {
  fs.mkdirSync(generatedQuestionsDir);
}

// Check if configuration exists
function getConfig() {
  const envKey = process.env.GROQ_API_KEY;
  const envModel = process.env.followupai_MODEL;
  
  if (envKey && envModel) {
    return { apiKey: envKey, model: envModel };
  }

  // Try to load from config file
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

// Initialize followupai
let followupai: followupaiClass | null = null;

try {
  const config = getConfig();
  if (config) {
    followupai = new followupaiClass(config);
    console.log('✅ followupai initialized with model:', config.model);
  } else {
    console.log('⚠️  No configuration found. Please run setup first.');
  }
} catch (error) {
  console.error('❌ Error initializing followupai:', error);
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../demo/index.html'));
});

app.get('/followupaidemo', (req, res) => {
  res.sendFile(path.join(__dirname, '../demo/index.html'));
});

app.post('/api/generate', async (req, res) => {
  if (!followupai) {
    return res.status(500).json({
      error: 'followupai not configured. Please run setup first.'
    });
  }

  try {
    const { topic, context, difficulty } = req.body;

    if (!topic) {
      return res.status(400).json({
        error: 'Topic is required'
      });
    }

    console.log(`Generating question for topic: ${topic}`);
    
    const question = await followupai.generateFollowUpQuestion(
      topic,
      context,
      difficulty
    );

    // Save the question to a file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `question-${timestamp}.json`;
    const filePath = path.join(generatedQuestionsDir, filename);
    
    fs.writeFileSync(filePath, JSON.stringify(question, null, 2));
    console.log(`Question saved to: ${filePath}`);

    res.json(question);
  } catch (error) {
    console.error('Error generating question:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    configured: followupai !== null,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 followupai Demo Server running on http://localhost:${PORT}`);
  console.log(`📱 Demo page available at http://localhost:${PORT}/followupaidemo`);
  
  if (!followupai) {
    console.log('\n⚠️  Setup Required:');
    console.log('1. Run "npm run setup" to configure your Groq API key');
    console.log('2. Or set GROQ_API_KEY and followupai_MODEL in your .env file');
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down followupai Demo Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down followupai Demo Server...');
  process.exit(0);
}); 