# AI Talking Bot (C# & .NET 8.0)

This directory contains the complete C# (.NET 8.0) implementation of the **Build Your First AI Talking Bot** assignment.

## Files Included:
- **`Program.cs`**: Main C# Console Application with interactive multi-turn chat, Gemini API integration, exit controls, and exception handling.
- **`TalkingBot.csproj`**: .NET 8.0 project file.
- **`toking_bot.cs`**: Direct assignment mirror for submissions requiring `toking_bot`.
- **`bot.cs`**: Alternate entry wrapper.

## How to Run:
1. Make sure you have [.NET 8.0 SDK](https://dotnet.microsoft.com/download) installed.
2. Open terminal in this folder:
   ```bash
   cd talking_bot
   ```
3. Set your Gemini API key (optional, you can also input it when prompted):
   ```bash
   export GEMINI_API_KEY="your_api_key_here"      # Linux/macOS
   # Or on Windows PowerShell:
   $env:GEMINI_API_KEY="your_api_key_here"
   ```
4. Run the application:
   ```bash
   dotnet run
   ```
5. Type `exit`, `quit`, or `bye` anytime to end the chat.
