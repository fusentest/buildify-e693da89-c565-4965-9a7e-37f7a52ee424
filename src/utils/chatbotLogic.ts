
// Simple chatbot logic with predefined responses

// Define response patterns
const responsePatterns: { [key: string]: string[] } = {
  greeting: [
    "Hello! How can I help you today?",
    "Hi there! What can I do for you?",
    "Greetings! How may I assist you?"
  ],
  farewell: [
    "Goodbye! Have a great day!",
    "See you later! Feel free to come back if you have more questions.",
    "Bye! It was nice chatting with you."
  ],
  thanks: [
    "You're welcome!",
    "Happy to help!",
    "Anytime! Is there anything else you need?"
  ],
  about: [
    "I'm a simple chatbot created to assist with basic questions and conversations.",
    "I'm your friendly AI assistant, here to help with information and tasks.",
    "I'm a chatbot designed to provide helpful responses to your questions."
  ],
  help: [
    "I can help with general information, answer questions, or just chat. What do you need assistance with?",
    "I'm here to assist you! You can ask me questions or just have a conversation.",
    "How can I help you today? I can provide information or just chat with you."
  ],
  weather: [
    "I'm sorry, I don't have access to real-time weather data. You might want to check a weather service for that information.",
    "I can't check the weather for you, but a quick online search should give you that information.",
    "I don't have weather capabilities, but there are many great weather apps and websites available."
  ],
  joke: [
    "Why don't scientists trust atoms? Because they make up everything!",
    "What did one wall say to the other wall? I'll meet you at the corner!",
    "Why did the scarecrow win an award? Because he was outstanding in his field!",
    "How does a penguin build its house? Igloos it together!"
  ],
  default: [
    "I'm not sure I understand. Could you rephrase that?",
    "Interesting. Tell me more about that.",
    "I'm still learning. Could you elaborate on that?",
    "I don't have information about that yet. Is there something else I can help with?"
  ]
};

// Function to get a random response from an array
const getRandomResponse = (responses: string[]): string => {
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
};

// Main function to determine response based on user input
export const getChatbotResponse = (userInput: string): string => {
  const input = userInput.toLowerCase();
  
  // Store message in localStorage for analytics
  storeMessage(userInput, 'user');
  
  // Check for greetings
  if (/^(hi|hello|hey|greetings|howdy)/i.test(input)) {
    const response = getRandomResponse(responsePatterns.greeting);
    storeMessage(response, 'bot');
    return response;
  }
  
  // Check for farewells
  if (/^(bye|goodbye|see you|farewell)/i.test(input)) {
    const response = getRandomResponse(responsePatterns.farewell);
    storeMessage(response, 'bot');
    return response;
  }
  
  // Check for thanks
  if (/^(thanks|thank you|appreciate it)/i.test(input)) {
    const response = getRandomResponse(responsePatterns.thanks);
    storeMessage(response, 'bot');
    return response;
  }
  
  // Check for questions about the bot
  if (/who are you|what are you|tell me about yourself|about you/i.test(input)) {
    const response = getRandomResponse(responsePatterns.about);
    storeMessage(response, 'bot');
    return response;
  }
  
  // Check for help requests
  if (/help|assist|support/i.test(input)) {
    const response = getRandomResponse(responsePatterns.help);
    storeMessage(response, 'bot');
    return response;
  }
  
  // Check for weather questions
  if (/weather|temperature|forecast|rain|sunny/i.test(input)) {
    const response = getRandomResponse(responsePatterns.weather);
    storeMessage(response, 'bot');
    return response;
  }
  
  // Check for joke requests
  if (/joke|funny|make me laugh/i.test(input)) {
    const response = getRandomResponse(responsePatterns.joke);
    storeMessage(response, 'bot');
    return response;
  }
  
  // Default response for unrecognized inputs
  const response = getRandomResponse(responsePatterns.default);
  storeMessage(response, 'bot');
  return response;
};

// Store messages in localStorage for analytics
const storeMessage = (text: string, sender: 'user' | 'bot') => {
  try {
    const storedMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    const newMessage = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('chatMessages', JSON.stringify([...storedMessages, newMessage]));
  } catch (error) {
    console.error('Error storing message:', error);
  }
};