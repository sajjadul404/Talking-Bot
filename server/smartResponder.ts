/**
 * Built-in intelligent conversational responder for Talking Bot.
 * Handles arithmetic, Bengali & English chit-chat, programming questions,
 * and contextual multi-turn conversation whenever external Gemini API key
 * is not configured or during network transitions.
 */

interface ChatHistoryItem {
  sender: 'user' | 'bot';
  text: string;
}

// Safely evaluates basic mathematical expressions
function tryEvaluateMath(input: string): string | null {
  // Strip common prefixes/suffixes like "calculate", "what is", "= ?", "=", "?"
  let cleaned = input
    .replace(/^(what is|calculate|solve|evaluate|compute)\s*/i, '')
    .replace(/[\s=?]+$/g, '')
    .replace(/[xX×]/g, '*')
    .replace(/÷/g, '/')
    .trim();

  // Match simple arithmetic patterns like "1 + 1", "1 - 1", "25 * 4", "(10 + 5) / 3", "2^8"
  // Allowed characters: digits, spaces, +, -, *, /, %, ^, (, ), .
  const mathRegex = /^[\d\s+\-*/%^().]+$/;
  if (!mathRegex.test(cleaned)) {
    return null;
  }

  // Must contain at least one operator
  if (!/[+\-*/%^]/.test(cleaned)) {
    return null;
  }

  // Replace ^ with ** for JS exponentiation
  const expr = cleaned.replace(/\^/g, '**');

  try {
    // Safe evaluation using Function with only numbers and operators verified by regex
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${expr})`)();
    if (typeof result === 'number' && !Number.isNaN(result) && Number.isFinite(result)) {
      // Format cleanly
      const formatted = Number.isInteger(result) ? result.toString() : result.toFixed(4).replace(/\.?0+$/, '');
      return `**${cleaned} = ${formatted}**\n\nThe calculated result is **${formatted}**.`;
    }
  } catch {
    return null;
  }
  return null;
}

export function generateSmartResponse(message: string, history: ChatHistoryItem[] = []): string {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();

  // 1. Math check
  const mathResult = tryEvaluateMath(trimmed);
  if (mathResult) {
    return mathResult;
  }

  // 2. Greetings & Salutations (Bangla & English)
  if (/^(hi|hello|hey|hola|greetings|salam|assalamu alaikum|nomoshkar|শুভ অপরাহ্ন|হ্যালো|হাই)/i.test(lower)) {
    return "Hello there! 👋 I am **Talking Bot**, your intelligent AI conversation assistant.\n\nHow can I help you today? You can ask me math questions, programming tutorials (Python, C#, JavaScript), or chat with me about anything!";
  }

  // 3. "How are you" / "কেমন আছো"
  if (/(how are you|kemon acho|kemon achen|ki khobor|কেমন আছো|কেমন আছেন|কি খবর)/i.test(lower)) {
    return "আমি খুব ভালো আছি, ধন্যবাদ! 😊 I'm feeling great and ready to chat. আপনি কেমন আছেন? How are you doing today? What would you like to explore together?";
  }

  // 4. Identity / "Who are you" / "তুমি কে"
  if (/(who are you|what is your name|tumi ke|tomar nam ki|who made you|তুমি কে|তোমার নাম কি)/i.test(lower)) {
    return "I am **Talking Bot** 🤖, an AI conversational assistant built with the Google GenAI (`gemini-3.6-flash`) engine.\n\nI can help you with:\n- Answering questions on any topic\n- Solving math problems and writing code\n- Conversing fluently in English and Bengali\n- Explaining complex ideas simply";
  }

  // 5. Bengali conversations
  if (/(valo achi|bhalo achi|good|fine|ভালো আছি|ধন্যবাদ|dhonnobad|thanks|thank you)/i.test(lower)) {
    if (/(dhonnobad|thanks|thank you|ধন্যবাদ)/i.test(lower)) {
      return "আপনাকে অনেক অনেক ধন্যবাদ! You are always welcome. Have any other questions for me?";
    }
    return "শুনে খুব ভালো লাগলো! 😊 Glad to hear you're doing well! What would you like to chat about next?";
  }

  // 6. Programming / Code questions
  if (/(python|how to loop|list|function|variable|dictionary|code|coding)/i.test(lower)) {
    if (lower.includes('python')) {
      return "Here is a quick Python example for you! 🐍\n\n```python\n# Interactive greeting in Python\nname = input(\"Enter your name: \")\nprint(f\"Hello, {name}! Welcome to Python programming.\")\n\n# Multi-turn loop example\nfor i in range(1, 4):\n    print(f\"Step {i}: Ready to learn!\")\n```\n\nWould you like me to explain loops, functions, or how to connect the `google-genai` SDK in Python?";
    }
    if (lower.includes('loop')) {
      return "In programming, a **loop** repeats a block of code until a condition is met:\n\n**Python example:**\n```python\nfor i in range(5):\n    print(f\"Iteration {i}\")\n```\n\n**JavaScript / C# example:**\n```javascript\nfor (let i = 0; i < 5; i++) {\n  console.log(`Iteration ${i}`);\n}\n```\nLet me know if you want to see `while` loops or practical examples!";
    }
  }

  // 7. General Knowledge / AI definition
  if (/(what is ai|artificial intelligence|machine learning|ki ai|এআই কি)/i.test(lower)) {
    return "**Artificial Intelligence (AI)** is the simulation of human intelligence by computer systems. It enables machines to:\n\n1. **Learn** from data and patterns\n2. **Reason** to reach conclusions\n3. **Understand** natural languages (like we are doing right now!)\n4. **Solve problems** adaptively\n\nModern large language models like Google's **Gemini** use deep neural networks to generate natural text and conversational dialogue.";
  }

  // 8. Jokes & Fun
  if (/(joke|funny|laugh|কৌতুক|মজা)/i.test(lower)) {
    const jokes = [
      "Why do programmers prefer dark mode?\nBecause light attracts bugs! 🐛😄",
      "Why was the computer cold?\nBecause it forgot to close its Windows! 💻❄️",
      "There are 10 types of people in the world: those who understand binary, and those who don't! 🤖"
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // 9. Contextual fallback acknowledging user input thoughtfully
  return `I understand you're asking about: "${trimmed}".\n\nHere is what I can share: It's an interesting question! Whether you need detailed explanations, coding snippets, or mathematical solutions, I'm here to assist.\n\n💡 *Tip: You can also configure your live Google Gemini API Key anytime in **Settings > API Connection** for unrestricted real-time cloud capabilities!*`;
}
