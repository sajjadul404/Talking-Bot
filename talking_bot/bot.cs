// ============================================================================
// Assignment Mirror: bot.cs
// Build Your First AI Talking Bot in C# (.NET 8.0)
// ============================================================================

using System.Threading.Tasks;

namespace TalkingBot
{
    public static class BotRunner
    {
        public static async Task RunAsync(string[] args)
        {
            await Program.Main(args);
        }
    }
}
