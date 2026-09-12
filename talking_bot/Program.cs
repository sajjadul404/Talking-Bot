// ============================================================================
// Assignment: Build Your First AI Talking Bot in C# (.NET 8.0)
// Step 1: Setup & Initialization
// Step 2: Gemini API Integration with HttpClient & Secure Key Handling
// Step 3: Multi-turn Chat Loop with Conversation Memory
// Step 4: Exit Controls ('exit', 'quit', 'bye')
// Step 5: Input Validation & Robust Exception/Error Handling
// ============================================================================

using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace TalkingBot
{
    public class Program
    {
        // Target model: gemini-2.5-flash (also compatible with gemini-3.6-flash)
        private const string GEMINI_MODEL = "gemini-2.5-flash";

        public static async Task Main(string[] args)
        {
            Console.OutputEncoding = System.Text.Encoding.UTF8;
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("╔════════════════════════════════════════════════════════════╗");
            Console.WriteLine("║            🤖 Welcome to AI Talking Bot (C#) 🤖            ║");
            Console.WriteLine("║        Type 'exit', 'quit', or 'bye' anytime to exit.      ║");
            Console.WriteLine("╚════════════════════════════════════════════════════════════╝");
            Console.ResetColor();

            // Step 2: Retrieve API Key securely from environment variable or user prompt
            string? apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY");
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine("\n[Notice] GEMINI_API_KEY environment variable is not set.");
                Console.Write("Enter your Gemini API Key: ");
                Console.ResetColor();
                apiKey = Console.ReadLine()?.Trim();
            }

            if (string.IsNullOrWhiteSpace(apiKey))
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("\n[Error] An API Key is required to run Talking Bot.");
                Console.WriteLine("Please set GEMINI_API_KEY in your environment or enter it on launch.");
                Console.ResetColor();
                return;
            }

            using var httpClient = new HttpClient();
            httpClient.Timeout = TimeSpan.FromSeconds(30);

            // Step 3: Conversation context memory for multi-turn dialogue
            var conversationHistory = new List<(string Role, string Text)>();

            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("\nBot: Hello! I'm your AI Talking Bot. How can I help you today?");
            Console.ResetColor();

            // Step 3: Active multi-turn chat loop
            while (true)
            {
                Console.ForegroundColor = ConsoleColor.White;
                Console.Write("\nYou: ");
                Console.ResetColor();
                string? userInput = Console.ReadLine()?.Trim();

                // Step 5: Handle blank inputs without crashing
                if (string.IsNullOrWhiteSpace(userInput))
                {
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.WriteLine("Bot: Please type something to chat!");
                    Console.ResetColor();
                    continue;
                }

                // Step 4: Clean exit controls when user types 'exit' or 'quit'
                if (Regex.IsMatch(userInput, "^(exit|quit|bye|goodbye)$", RegexOptions.IgnoreCase))
                {
                    Console.ForegroundColor = ConsoleColor.Magenta;
                    Console.WriteLine("\nBot: Thanks for chatting with Talking Bot! See you again.\n");
                    Console.ResetColor();
                    break;
                }

                // Step 3 & 5: Generate AI response with error handling
                try
                {
                    Console.ForegroundColor = ConsoleColor.DarkGray;
                    Console.Write("Bot is thinking...");
                    Console.ResetColor();

                    string botReply = await GetGeminiResponseAsync(httpClient, apiKey, userInput, conversationHistory);

                    // Clear the 'is thinking...' message
                    Console.Write("\r" + new string(' ', 25) + "\r");

                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine($"Bot: {botReply}");
                    Console.ResetColor();

                    // Update conversation history context
                    conversationHistory.Add(("user", userInput));
                    conversationHistory.Add(("model", botReply));
                }
                catch (HttpRequestException httpEx)
                {
                    Console.Write("\r" + new string(' ', 25) + "\r");
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine($"\nBot [Notice]: Network glitch or service error ({httpEx.Message}).");
                    Console.WriteLine("Don't worry! Please check your internet connection and try again.");
                    Console.ResetColor();
                }
                catch (Exception ex)
                {
                    Console.Write("\r" + new string(' ', 25) + "\r");
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine($"\nBot [Notice]: Something went wrong ({ex.Message}).");
                    Console.WriteLine("Let's try again! What were you saying?");
                    Console.ResetColor();
                }
            }
        }

        /// <summary>
        /// Communicates with Google Gemini API via HttpClient and System.Text.Json
        /// </summary>
        private static async Task<string> GetGeminiResponseAsync(
            HttpClient client,
            string apiKey,
            string prompt,
            List<(string Role, string Text)> history)
        {
            var contents = new List<object>();

            // Include last 8 turns of context history for fast multi-turn responses
            int startIndex = Math.Max(0, history.Count - 8);
            for (int i = startIndex; i < history.Count; i++)
            {
                contents.Add(new
                {
                    role = history[i].Role,
                    parts = new[] { new { text = history[i].Text } }
                });
            }

            // Current prompt
            contents.Add(new
            {
                role = "user",
                parts = new[] { new { text = prompt } }
            });

            var payload = new
            {
                contents = contents,
                generationConfig = new
                {
                    temperature = 0.7,
                    maxOutputTokens = 1000
                }
            };

            string endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={apiKey}";
            var response = await client.PostAsJsonAsync(endpoint, payload);

            if (!response.IsSuccessStatusCode)
            {
                string errorContent = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Gemini API error ({response.StatusCode}): {errorContent}");
            }

            var jsonResult = await response.Content.ReadFromJsonAsync<JsonElement>();
            string? text = jsonResult
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return text?.Trim() ?? "I am ready to chat!";
        }
    }
}
