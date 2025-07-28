#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to display ASCII art
function showAsciiArt() {
  try {
    // Try to read the ASCII art file
    const asciiPath = path.join(__dirname, 'ascii-art.txt');
    
    if (fs.existsSync(asciiPath)) {
      const asciiArt = fs.readFileSync(asciiPath, 'utf8');
      console.log('\n' + asciiArt);
    } else {
      // Fallback ASCII art if file doesn't exist
      console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    ███████╗ ██████╗ ██╗     ██╗     ██████╗ ██╗   ██╗    ║
║    ██╔════╝██╔═══██╗██║     ██║     ██╔══██╗██║   ██║    ║
║    █████╗  ██║   ██║██║     ██║     ██████╔╝██║   ██║    ║
║    ██╔══╝  ██║   ██║██║     ██║     ██╔═══╝ ██║   ██║    ║
║    ██║     ╚██████╔╝███████╗███████╗██║     ╚██████╔╝    ║
║    ╚═╝      ╚═════╝ ╚══════╝╚══════╝╚═╝      ╚═════╝     ║
║                                                              ║
║              AI-Powered Question Generator                    ║
║                                                              ║
║    🚀 Add a powerful AI chatbot to any page with just       ║
║       1 line of code!                                        ║
║                                                              ║
║    📦 Installed successfully!                                ║
║    💡 Get started: npm run demo                              ║
║    📖 Docs: https://github.com/Edpear/followupai            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);
    }
    
    // Show installation success message
    console.log('\n✨ FollowUpAI has been installed successfully!');
    console.log('\n📚 Quick Start:');
    console.log('   npm run demo          # Start the demo server');
    console.log('   npx followupai setup  # Configure your API key');
    console.log('   npx followupai generate "JavaScript"  # Generate a question');
    console.log('\n🔗 Documentation: https://github.com/Edpear/followupai');
    console.log('💬 Support: https://github.com/Edpear/followupai/issues\n');
    
  } catch (error) {
    // If there's an error, show a simple success message
    console.log('\n✨ FollowUpAI has been installed successfully!');
    console.log('📖 Visit: https://github.com/Edpear/followupai for documentation\n');
  }
}

// Run the ASCII art display
showAsciiArt(); 