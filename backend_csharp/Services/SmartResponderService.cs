using System;
using System.Text.RegularExpressions;

namespace TalkingBot.Backend.Services
{
    public interface ISmartResponderService
    {
        string GetSmartResponse(string prompt);
    }

    public class SmartResponderService : ISmartResponderService
    {
        public string GetSmartResponse(string prompt)
        {
            string clean = prompt.ToLower().Trim();

            // Greetings
            if (Regex.IsMatch(clean, @"\b(hi|hello|hey|assalamu alaikum|kemon acho)\b"))
            {
                return "Hello! I am your AI Talking Bot powered by ASP.NET Core & C#. How can I assist you with programming, technology, or creative ideas today?";
            }

            // Python questions
            if (clean.Contains("python"))
            {
                return "Python is a versatile, high-level language renowned for simplicity, machine learning, and rapid development. Key concepts include dynamic typing, clean syntax with indentation, list comprehensions, and rich libraries like PyTorch and NumPy.";
            }

            // C# and .NET questions
            if (clean.Contains("c#") || clean.Contains(".net") || clean.Contains("dotnet"))
            {
                return "C# and .NET 8 represent Microsoft's modern, high-performance, cross-platform ecosystem. It features strongly-typed object-oriented architecture, pattern matching, async/await concurrency, and world-class web performance with ASP.NET Core Kestrel!";
            }

            // Cloud computing
            if (clean.Contains("cloud") || clean.Contains("azure") || clean.Contains("aws"))
            {
                return "Cloud computing delivers computing services—including servers, storage, databases, and networking—over the internet. Instead of maintaining physical data centers, you rent scalable infrastructure on demand!";
            }

            // Exit commands
            if (Regex.IsMatch(clean, @"^(exit|quit|bye|goodbye)$"))
            {
                return "Thanks for chatting with Talking Bot! See you again soon.";
            }

            // Default intelligent conversational reply
            return $"Thank you for your question: \"{prompt}\"! " +
                   "I am running on the ASP.NET Core 8.0 C# backend service. " +
                   "To enable live Gemini AI intelligence for every prompt, please configure your GEMINI_API_KEY in the Settings or environment variables.";
        }
    }
}
