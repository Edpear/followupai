// Simple Chat Usage Examples
// Add this to any React page for instant chatbot functionality

// Method 1: Super simple - just 1 line!
import { QuickChat } from '../src/components/SimpleChat';

// In your React component:
function MyPage() {
  return (
    <div>
      <h1>My Website</h1>
      <QuickChat apiKey="your-groq-api-key" />
    </div>
  );
}

// Method 2: With environment variable (recommended)
import { SimpleChat } from '../src/components/SimpleChat';

// In your React component:
function MyPage() {
  return (
    <div>
      <h1>My Website</h1>
      <SimpleChat 
        placeholder="Ask me to create a question about any topic..."
        style={{ maxWidth: '500px' }}
      />
    </div>
  );
}

// Method 3: Customized chat
function MyCustomPage() {
  return (
    <div>
      <h1>Educational Platform</h1>
      <SimpleChat 
        apiKey="your-groq-api-key"
        model="llama-3.1-70b-version"
        placeholder="What topic would you like me to create a question about?"
        className="my-custom-chat"
        style={{ 
          maxWidth: '800px',
          border: '2px solid #007bff',
          borderRadius: '16px'
        }}
      />
    </div>
  );
}

// Method 4: Multiple chats on one page
function DashboardPage() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <div>
        <h3>Math Questions</h3>
        <SimpleChat 
          apiKey="your-groq-api-key"
          placeholder="Ask for math questions..."
        />
      </div>
      <div>
        <h3>Science Questions</h3>
        <SimpleChat 
          apiKey="your-groq-api-key"
          placeholder="Ask for science questions..."
        />
      </div>
    </div>
  );
}

// HTML Usage (if you're not using React):
/*
<!DOCTYPE html>
<html>
<head>
    <title>My Chat Page</title>
    <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    
    <script type="text/babel">
        const { QuickChat } = window.SimpleChat;
        
        function App() {
            return (
                <div>
                    <h1>Welcome to My Site</h1>
                    <QuickChat apiKey="your-groq-api-key" />
                </div>
            );
        }
        
        ReactDOM.render(<App />, document.getElementById('root'));
    </script>
</body>
</html>
*/ 