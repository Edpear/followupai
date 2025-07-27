# FollowUpAI - AI-Powered Question Generator & Chatbot

> **Add a powerful AI chatbot to any page with just 1 line of code!**

FollowUpAI is a versatile tool that generates intelligent follow-up questions using the Groq API. Perfect for educators, content creators, and developers who want to add AI-powered question generation to their applications.

## Features

- **One-line chatbot setup** - Add AI chat to any page instantly
- **Smart question generation** - Creates multiple choice questions from any topic
- **Interactive learning experience** - Users get answers followed by comprehension tests
- **Beautiful UI** - Modern, responsive chat interface
- **Fast & lightweight** - Built with TypeScript and React
- **Highly customizable** - Easy to style and configure
- **Environment support** - Use .env files for API keys
- **Mobile responsive** - Works perfectly on all devices

## Quick Start

### 1. Install
```bash
npm install followupai
```

### 2. Get your Groq API key
Visit [console.groq.com](https://console.groq.com) to get your free API key.

### 3. Add to your React app (1 line!)
```jsx
import { QuickChat } from 'followupai';

function MyPage() {
  return (
    <div>
      <h1>My Website</h1>
      <QuickChat apiKey="your-groq-api-key" />
    </div>
  );
}
```

**That's it!** You now have a fully functional AI chatbot that generates questions about any topic.

## Usage Examples

### Super Simple (1 line)
```jsx
import { QuickChat } from 'followupai';

<QuickChat apiKey="your-groq-api-key" />
```

### With Environment Variable
```jsx
// Set GROQ_API_KEY in your .env file
<QuickChat />
```

### Customized Chat
```jsx
import { SimpleChat } from 'followupai';

<SimpleChat 
  apiKey="your-groq-api-key"
  model="llama-3.1-70b-version"
  placeholder="What topic would you like me to create a question about?"
  style={{ 
    maxWidth: '800px',
    border: '2px solid #007bff',
    borderRadius: '16px'
  }}
/>
```

### Multiple Chats on One Page
```jsx
<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
  <div>
    <h3>Math Questions</h3>
    <QuickChat placeholder="Ask for math questions..." />
  </div>
  <div>
    <h3>Science Questions</h3>
    <QuickChat placeholder="Ask for science questions..." />
  </div>
</div>
```

## Interactive Learning Experience

The chatbot provides a two-step learning process:

1. **Answer Generation**: When users ask a question, they receive a comprehensive answer
2. **Comprehension Test**: The chatbot then generates an interactive multiple-choice question to test understanding

### Example Flow:
- **User asks**: "What is JavaScript?"
- **Bot responds**: Detailed explanation about JavaScript
- **Bot follows up**: Interactive quiz question about JavaScript concepts
- **User can**: Click answer choices, check their answer, and see explanations

### Interactive Features:
- **Clickable choice buttons** with A, B, C, D labels
- **Visual feedback** with color-coded results (green for correct, red for incorrect)
- **Immediate validation** with "Check Answer" button
- **Detailed explanations** for each answer
- **New question generation** to continue learning

## What Users Can Ask

Users can ask the chatbot to generate questions about any topic:

- "Create a question about JavaScript"
- "Generate a math problem for 5th graders"
- "Make a science quiz about the solar system"
- "Ask me about machine learning concepts"
- "Create a history question about World War II"

The chatbot will respond with:
- A comprehensive answer to their question
- An interactive multiple choice question
- 4 answer choices (A, B, C, D)
- The correct answer with explanation

## Advanced Usage

### Programmatic Question Generation
```javascript
import { followupai } from 'followupai';

const ai = new followupai({
  apiKey: 'your-groq-api-key',
  model: 'llama-3.1-8b-instant'
});

// Generate a single question
const question = await ai.generateFollowUpQuestion(
  'JavaScript',
  'Focus on ES6 features',
  'medium'
);

console.log(question.question);
console.log(question.choices);
console.log(question.correctAnswer);
console.log(question.explanation);

// Generate multiple questions
const questions = await ai.generateMultipleQuestions(
  'Machine Learning',
  5,
  'Focus on neural networks',
  'hard'
);
```

### CLI Usage
```bash
# Setup (first time)
npx followupai setup

# Generate a question
npx followupai generate "JavaScript"

# Generate multiple questions
npx followupai generate-multiple "Machine Learning" 5

# Start demo server
npx followupai demo
```

## Customization Options

### SimpleChat Props
```typescript
interface SimpleChatProps {
  apiKey?: string;           // Your Groq API key
  model?: string;            // Groq model to use
  placeholder?: string;      // Input placeholder text
  className?: string;        // CSS class name
  style?: React.CSSProperties; // Inline styles
}
```

### Available Models
- `llama-3.1-8b-instant` (fastest)
- `llama-3.1-70b-version` (balanced)
- `llama-3.1-405b-reasoning` (most capable)
- `mixtral-8x7b-32768`
- `gemma-7b-it`

## Configuration

### Environment Variables
Create a `.env` file in your project root:
```bash
GROQ_API_KEY=your_api_key_here
followupai_MODEL=llama-3.1-8b-instant
```

### Configuration File
Or create a `followupai.config.json`:
```json
{
  "apiKey": "your_api_key_here",
  "model": "llama-3.1-8b-instant"
}
```

## Installation

### NPM
```bash
npm install followupai
```

### Yarn
```bash
yarn add followupai
```

### PNPM
```bash
pnpm add followupai
```

## Demo

Try the live demo:
```bash
npx followupai demo
```

Then visit `http://localhost:3000` to see the chatbot in action!

## Project Structure

```
followupai/
├── src/
│   ├── components/
│   │   ├── SimpleChat.tsx      # Main chatbot component
│   │   └── EasyFollowChat.tsx  # Advanced chat component
│   ├── followupai.ts           # Core API class
│   ├── cli.ts                  # Command line interface
│   ├── demo-server.ts          # Demo server
│   └── types.ts                # TypeScript definitions
├── examples/
│   ├── simple-chat-usage.js    # Simple usage examples
│   ├── basic-usage.js          # Basic API usage
│   └── advanced-usage.js       # Advanced API usage
├── demo/
│   ├── index.html              # Main demo page
│   └── simple-chat-demo.html   # Simple chat demo
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Groq](https://groq.com) for providing the fast AI API
- [React](https://reactjs.org) for the amazing UI framework
- [TypeScript](https://www.typescriptlang.org) for type safety

## Support

- Email: support@followupai.com
- Issues: [GitHub Issues](https://github.com/your-repo/followupai/issues)
- Documentation: [GitHub Wiki](https://github.com/your-repo/followupai/wiki)

---

**Made with ❤️ for educators and developers**
